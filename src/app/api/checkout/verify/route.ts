import { NextResponse } from "next/server";
import { z } from "zod";
import { formatPrice, getOffer } from "@/content/site.config";
import { captureOrder } from "@/lib/payments/paypal";
import { retrieveCheckoutSession } from "@/lib/payments/stripe";
import { adminEmail, definitionList, emailLayout, sendEmail } from "@/lib/email";

/**
 * Vérifie côté serveur qu'un paiement est bien encaissé avant d'autoriser la
 * sélection d'un créneau (§11 : « La réservation ne doit pas être considérée
 * comme définitive si le paiement échoue »).
 *
 * Le client ne peut pas se déclarer payé lui-même : l'état est toujours relu
 * auprès de Stripe ou de PayPal.
 */

const verifySchema = z.object({
  provider: z.enum(["stripe", "paypal"]),
  reference: z.string().min(4).max(255),
  offerSlug: z.string().min(1).max(60),
});

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

  const offer = getOffer(parsed.data.offerSlug);
  if (!offer) {
    return NextResponse.json({ paid: false, error: "Prestation inconnue." }, { status: 404 });
  }

  const expectedCents = Math.round(offer.price * 100);

  try {
    if (parsed.data.provider === "stripe") {
      const session = await retrieveCheckoutSession(parsed.data.reference);
      const paid = session.payment_status === "paid";
      const amountMatches = (session.amount_total ?? 0) >= expectedCents;

      if (!paid) {
        return NextResponse.json({ paid: false, error: paymentPendingMessage(paid) });
      }
      if (!amountMatches) {
        console.error("[verify] Montant Stripe inattendu", session.id, session.amount_total);
        return NextResponse.json({ paid: false, error: amountMismatchMessage() });
      }

      await notifyAdmin({
        offerName: offer.name,
        amount: formatPrice(offer.price),
        method: "Carte bancaire (Stripe)",
        reference: session.id,
        email: session.customer_details?.email ?? undefined,
        name: session.customer_details?.name ?? undefined,
      });

      return NextResponse.json({ paid: true, reference: session.id });
    }

    const order = await captureOrder(parsed.data.reference);
    const unit = order.purchase_units?.[0];
    const paidValue = Number(unit?.amount?.value ?? "0");
    const completed = order.status === "COMPLETED";

    if (!completed) {
      return NextResponse.json({ paid: false, error: paymentPendingMessage(false) });
    }
    if (Math.round(paidValue * 100) < expectedCents) {
      console.error("[verify] Montant PayPal inattendu", order.id, unit?.amount?.value);
      return NextResponse.json({ paid: false, error: amountMismatchMessage() });
    }

    await notifyAdmin({
      offerName: offer.name,
      amount: formatPrice(offer.price),
      method: "PayPal",
      reference: order.id,
      email: order.payer?.email_address,
      name: [order.payer?.name?.given_name, order.payer?.name?.surname].filter(Boolean).join(" "),
    });

    return NextResponse.json({ paid: true, reference: order.id });
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

function paymentPendingMessage(paid: boolean): string {
  return paid
    ? "Paiement en cours de traitement, merci de patienter quelques instants."
    : "Le paiement n'a pas été validé. Aucun rendez-vous n'a été réservé et aucune somme n'est due.";
}

function amountMismatchMessage(): string {
  return "Le montant réglé ne correspond pas à la prestation choisie. Contacte-moi pour régulariser.";
}

/** Notifie l'accompagnatrice qu'un paiement vient d'être encaissé. */
async function notifyAdmin(payment: {
  offerName: string;
  amount: string;
  method: string;
  reference: string;
  email?: string;
  name?: string;
}) {
  await sendEmail({
    to: adminEmail(),
    subject: `Paiement reçu — ${payment.offerName} (${payment.amount})`,
    html: emailLayout(
      "Nouveau paiement encaissé",
      `${definitionList([
        ["Prestation", payment.offerName],
        ["Montant", payment.amount],
        ["Moyen de paiement", payment.method],
        ["Client", payment.name || undefined],
        ["Email", payment.email || undefined],
        ["Référence", payment.reference],
      ])}<p style="margin-top:18px;">Le client choisit maintenant son créneau dans Calendly. Tu recevras la confirmation du rendez-vous séparément.</p>`,
    ),
  });
}
