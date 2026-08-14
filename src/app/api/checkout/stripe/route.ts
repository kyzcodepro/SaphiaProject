import { NextResponse } from "next/server";
import { getOffer } from "@/content/site.config";
import { createCheckoutSession, stripeConfigured } from "@/lib/payments/stripe";
import { checkoutSchema } from "@/lib/validation";
import { siteOrigin } from "@/lib/request";

/** Crée une session de paiement Stripe Checkout (§33). */
export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Le paiement par carte n'est pas encore actif. Choisis PayPal ou contacte-moi directement.",
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
    const session = await createCheckoutSession({
      offerSlug: offer.slug,
      offerName: offer.name,
      offerDescription: offer.shortDescription,
      // Le montant provient toujours de la configuration serveur, jamais du client.
      amountEuros: offer.price,
      customerEmail: parsed.data.email,
      successUrl: `${origin}/reserver/${offer.slug}?payment=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/reserver/${offer.slug}?payment=cancelled`,
      metadata: {
        client: `${parsed.data.firstName} ${parsed.data.lastName}`.slice(0, 100),
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Session de paiement invalide." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error("[stripe] Création de session échouée:", error);
    return NextResponse.json(
      { error: "Le paiement n'a pas pu être initialisé. Merci de réessayer dans un instant." },
      { status: 502 },
    );
  }
}
