import { NextResponse } from "next/server";
import { adminEmail, definitionList, emailLayout, sendEmail } from "@/lib/email";
import { verifyWebhookSignature } from "@/lib/payments/stripe";

/**
 * Webhook Stripe (§33) — filet de sécurité indépendant du navigateur.
 *
 * Si le client ferme son onglet juste après avoir payé, la vérification côté
 * page n'a pas lieu : ce webhook garantit que le paiement est tout de même
 * signalé à l'accompagnatrice, qui peut alors relancer le client pour qu'il
 * choisisse son créneau.
 *
 * Configuration : Stripe Dashboard → Developers → Webhooks →
 *   URL   : https://<domaine>/api/webhooks/stripe
 *   Events: checkout.session.completed, checkout.session.async_payment_failed
 */

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      payment_status?: string;
      amount_total?: number;
      currency?: string;
      customer_details?: { email?: string; name?: string };
      metadata?: Record<string, string>;
    };
  };
};

export async function POST(request: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    // Sans secret configuré, on refuse plutôt que de traiter un message non signé.
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Charge utile invalide." }, { status: 400 });
  }

  const session = event.data.object;

  if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
    const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
    await sendEmail({
      to: adminEmail(),
      subject: `Paiement confirmé — ${session.metadata?.offer ?? "prestation"} (${amount} €)`,
      html: emailLayout(
        "Paiement confirmé par Stripe",
        `${definitionList([
          ["Prestation", session.metadata?.offer],
          ["Montant", `${amount} ${(session.currency ?? "eur").toUpperCase()}`],
          ["Client", session.metadata?.client ?? session.customer_details?.name],
          ["Email", session.customer_details?.email],
          ["Référence Stripe", session.id],
        ])}<p style="margin-top:18px;">Vérifie dans Calendly que le rendez-vous a bien été programmé. Si ce n'est pas le cas, relance le client avec le lien de réservation.</p>`,
      ),
    });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    await sendEmail({
      to: adminEmail(),
      subject: "Paiement échoué — aucune réservation confirmée",
      html: emailLayout(
        "Paiement échoué",
        definitionList([
          ["Prestation", session.metadata?.offer],
          ["Email", session.customer_details?.email],
          ["Référence Stripe", session.id],
        ]),
      ),
    });
  }

  return NextResponse.json({ received: true });
}
