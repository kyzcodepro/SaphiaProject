import { NextResponse } from "next/server";
import { getOffer } from "@/content/site.config";
import { createOrder, paypalConfigured } from "@/lib/payments/paypal";
import { checkoutSchema } from "@/lib/validation";
import { siteOrigin } from "@/lib/request";

/** Crée un ordre de paiement PayPal (§34). */
export async function POST(request: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json(
      {
        error:
          "Le paiement PayPal n'est pas encore actif. Choisis la carte bancaire ou contacte-moi directement.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Informations client incomplètes." }, { status: 400 });
  }

  const offer = getOffer(parsed.data.offerSlug);
  if (!offer) {
    return NextResponse.json({ error: "Prestation inconnue." }, { status: 404 });
  }
  if (offer.price <= 0) {
    return NextResponse.json(
      { error: "Cette prestation est gratuite, aucun paiement n'est nécessaire." },
      { status: 400 },
    );
  }

  const origin = siteOrigin(request);

  try {
    const { approveUrl, order } = await createOrder({
      offerSlug: offer.slug,
      offerName: offer.name,
      // Montant issu de la configuration serveur, jamais du client.
      amountEuros: offer.price,
      customId: `${offer.slug}|${parsed.data.email}`,
      returnUrl: `${origin}/reserver/${offer.slug}?payment=paypal`,
      cancelUrl: `${origin}/reserver/${offer.slug}?payment=cancelled`,
    });

    return NextResponse.json({ url: approveUrl, id: order.id });
  } catch (error) {
    console.error("[paypal] Création de commande échouée:", error);
    return NextResponse.json(
      { error: "Le paiement PayPal n'a pas pu être initialisé. Merci de réessayer." },
      { status: 502 },
    );
  }
}
