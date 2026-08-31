import { NextResponse } from "next/server";
import { checkoutReturnPath, getPurchasable } from "@/content/site.config";
import { createCheckoutSession, stripeConfigured } from "@/lib/payments/stripe";
import { checkoutSchema } from "@/lib/validation";
import { siteOrigin } from "@/lib/request";

/** Crée une session de paiement Stripe Checkout (§33), pour une séance ou l'ebook. */
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

  const product = getPurchasable(parsed.data.offerSlug);
  if (!product) {
    return NextResponse.json({ error: "Prestation inconnue." }, { status: 404 });
  }
  if (product.price <= 0) {
    return NextResponse.json(
      { error: "Cette prestation est gratuite, aucun paiement n'est nécessaire." },
      { status: 400 },
    );
  }

  const origin = siteOrigin(request);
  const returnPath = checkoutReturnPath(product.slug);

  try {
    const session = await createCheckoutSession({
      offerSlug: product.slug,
      offerName: product.name,
      offerDescription: product.description,
      // Le montant provient toujours de la configuration serveur, jamais du client.
      amountEuros: product.price,
      // L’ebook est relié au produit/tarif créé dans le catalogue Stripe.
      priceId:
        product.slug === "ebook"
          ? process.env.STRIPE_EBOOK_PRICE_ID || "price_1UAbH0Dtqk1qvqGzMDAsxvGA"
          : undefined,
      customerEmail: parsed.data.email,
      successUrl: `${origin}${returnPath}?payment=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}${returnPath}?payment=cancelled`,
      metadata: {
        client: `${parsed.data.firstName} ${parsed.data.lastName}`.slice(0, 100),
        firstName: parsed.data.firstName.slice(0, 60),
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
