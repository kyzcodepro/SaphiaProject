import crypto from "node:crypto";

/**
 * Intégration Stripe (§33) via l'API REST, sans SDK.
 *
 * Variables d'environnement :
 *  - STRIPE_SECRET_KEY      : clé secrète (sk_test_… / sk_live_…)
 *  - STRIPE_WEBHOOK_SECRET  : secret de signature du webhook (whsec_…)
 */

const STRIPE_API = "https://api.stripe.com/v1";

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Encode un objet imbriqué au format attendu par l'API Stripe. */
function toFormData(data: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          parts.push(...toFormData(item as Record<string, unknown>, `${name}[${index}]`));
        } else {
          parts.push(`${encodeURIComponent(`${name}[${index}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof value === "object") {
      parts.push(...toFormData(value as Record<string, unknown>, name));
    } else {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

async function stripeRequest<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: Record<string, unknown> },
): Promise<T> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY manquante");

  const response = await fetch(`${STRIPE_API}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2024-06-20",
    },
    body: init.body ? toFormData(init.body).join("&") : undefined,
  });

  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Stripe a répondu ${response.status}`);
  }
  return payload;
}

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  status: "open" | "complete" | "expired";
  amount_total: number | null;
  currency: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: Record<string, string>;
};

export async function createCheckoutSession(params: {
  offerSlug: string;
  offerName: string;
  offerDescription: string;
  amountEuros: number;
  /** Tarif Stripe existant à utiliser, lorsque le produit est déjà catalogué. */
  priceId?: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>("/checkout/sessions", {
    method: "POST",
    body: {
      mode: "payment",
      customer_email: params.customerEmail,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      locale: "fr",
      // Reçu automatique envoyé par Stripe (§33)
      payment_intent_data: {
        description: `${params.offerName} — ${params.customerEmail}`,
        metadata: { offer: params.offerSlug, ...params.metadata },
      },
      metadata: { offer: params.offerSlug, ...params.metadata },
      line_items: [
        {
          quantity: 1,
          ...(params.priceId
            ? { price: params.priceId }
            : {
                price_data: {
                  currency: "eur",
                  unit_amount: Math.round(params.amountEuros * 100),
                  product_data: {
                    name: params.offerName,
                    description: params.offerDescription.slice(0, 500),
                  },
                },
              }),
        },
      ],
    },
  });
}

export async function retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>(
    `/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { method: "GET" },
  );
}

/**
 * Vérifie la signature d'un webhook Stripe (en-tête `Stripe-Signature`).
 * Implémentation du schéma v1 documenté par Stripe, sans SDK.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  toleranceSeconds = 300,
): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const index = part.indexOf("=");
      return [part.slice(0, index).trim(), part.slice(index + 1).trim()];
    }),
  );

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
