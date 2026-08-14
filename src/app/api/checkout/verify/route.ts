import { NextResponse } from "next/server";
import { z } from "zod";
import { EBOOK_SLUG, formatPrice, getPurchasable } from "@/content/site.config";
import { captureOrder } from "@/lib/payments/paypal";
import { retrieveCheckoutSession } from "@/lib/payments/stripe";
import { adminEmail, definitionList, emailLayout, sendEmail } from "@/lib/email";
import { downloadUrl, notifyEbookSale, sendEbookToBuyer } from "@/lib/ebook-delivery";
import { siteOrigin } from "@/lib/request";

/**
 * Vérifie côté serveur qu'un paiement est bien encaissé (§11 : « La réservation
 * ne doit pas être considérée comme définitive si le paiement échoue »).
 *
 * Pour une séance, cela débloque la sélection du créneau.
 * Pour l'ebook, cela déclenche l'envoi du lien de téléchargement.
 *
 * Le client ne peut pas se déclarer payé lui-même : l'état est toujours relu
 * auprès de Stripe ou de PayPal.
 */

const verifySchema = z.object({
  provider: z.enum(["stripe", "paypal"]),
  reference: z.string().min(4).max(255),
  offerSlug: z.string().min(1).max(60),
});

type Buyer = { email?: string; firstName?: string; fullName?: string };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ paid: false, error: "Requête invalide." }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ paid: false, error: "Requête invalide." }, { status: 400 });
  }

  const product = getPurchasable(parsed.data.offerSlug);
  if (!product) {
    return NextResponse.json({ paid: false, error: "Prestation inconnue." }, { status: 404 });
  }

  const { provider, reference } = parsed.data;
  const expectedCents = Math.round(product.price * 100);

  try {
    let buyer: Buyer = {};
    let confirmedReference = reference;

    if (provider === "stripe") {
      const session = await retrieveCheckoutSession(reference);

      if (session.payment_status !== "paid") {
        return NextResponse.json({ paid: false, error: NOT_PAID_MESSAGE });
      }
      if ((session.amount_total ?? 0) < expectedCents) {
        console.error("[verify] Montant Stripe inattendu", session.id, session.amount_total);
        return NextResponse.json({ paid: false, error: AMOUNT_MISMATCH_MESSAGE });
      }

      confirmedReference = session.id;
      buyer = {
        email: session.customer_details?.email ?? undefined,
        firstName: session.metadata?.firstName,
        fullName: session.customer_details?.name ?? session.metadata?.client,
      };
    } else {
      const order = await captureOrder(reference);
      const unit = order.purchase_units?.[0];
      const paidCents = Math.round(Number(unit?.amount?.value ?? "0") * 100);

      if (order.status !== "COMPLETED") {
        return NextResponse.json({ paid: false, error: NOT_PAID_MESSAGE });
      }
      if (paidCents < expectedCents) {
        console.error("[verify] Montant PayPal inattendu", order.id, unit?.amount?.value);
        return NextResponse.json({ paid: false, error: AMOUNT_MISMATCH_MESSAGE });
      }

      confirmedReference = order.id;
      buyer = {
        email: order.payer?.email_address,
        firstName: order.payer?.name?.given_name,
        fullName: [order.payer?.name?.given_name, order.payer?.name?.surname]
          .filter(Boolean)
          .join(" "),
      };
    }

    const method = provider === "stripe" ? "Carte bancaire (Stripe)" : "PayPal";
    const amount = formatPrice(product.price);

    /* ── Ebook : livraison immédiate par email ─────────────────────────────── */
    if (product.slug === EBOOK_SLUG) {
      const origin = siteOrigin(request);
      const link = downloadUrl(origin, provider, confirmedReference);

      if (buyer.email) {
        await sendEbookToBuyer({
          to: buyer.email,
          firstName: buyer.firstName,
          link,
          origin,
        });
      }
      await notifyEbookSale({
        email: buyer.email,
        firstName: buyer.fullName ?? buyer.firstName,
        amount,
        method,
        reference: confirmedReference,
      });

      return NextResponse.json({
        paid: true,
        reference: confirmedReference,
        // Permet le téléchargement immédiat depuis la page, sans attendre l'email.
        downloadUrl: link,
        email: buyer.email,
      });
    }

    /* ── Séance : le client passe ensuite au choix du créneau ──────────────── */
    await sendEmail({
      to: adminEmail(),
      subject: `Paiement reçu — ${product.name} (${amount})`,
      html: emailLayout(
        "Nouveau paiement encaissé",
        `${definitionList([
          ["Prestation", product.name],
          ["Montant", amount],
          ["Moyen de paiement", method],
          ["Cliente", buyer.fullName || undefined],
          ["Email", buyer.email || undefined],
          ["Référence", confirmedReference],
        ])}<p style="margin-top:18px;">La cliente choisit maintenant son créneau dans Calendly. Tu recevras la confirmation du rendez-vous séparément.</p>`,
      ),
    });

    return NextResponse.json({ paid: true, reference: confirmedReference });
  } catch (error) {
    console.error("[verify] Vérification du paiement échouée:", error);
    return NextResponse.json(
      {
        paid: false,
        error:
          "Impossible de confirmer le paiement pour le moment. Si une somme a été débitée, contacte-moi : je vérifie et je régularise.",
      },
      { status: 502 },
    );
  }
}

const NOT_PAID_MESSAGE =
  "Le paiement n'a pas été validé. Aucune commande n'a été enregistrée et aucune somme n'est due.";

const AMOUNT_MISMATCH_MESSAGE =
  "Le montant réglé ne correspond pas à la prestation choisie. Contacte-moi pour régulariser.";
