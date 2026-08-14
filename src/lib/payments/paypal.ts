/**
 * Intégration PayPal (§34) — API Orders v2, sans SDK.
 *
 * Variables d'environnement :
 *  - PAYPAL_CLIENT_ID
 *  - PAYPAL_CLIENT_SECRET
 *  - PAYPAL_ENVIRONMENT : "sandbox" (défaut) ou "live"
 */

export function paypalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function apiBase(): string {
  return process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function accessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Identifiants PayPal manquants");

  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Authentification PayPal échouée (${response.status})`);
  }

  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
}

type PayPalLink = { href: string; rel: string; method?: string };

export type PayPalOrder = {
  id: string;
  status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED";
  links?: PayPalLink[];
  purchase_units?: {
    reference_id?: string;
    custom_id?: string;
    amount?: { value: string; currency_code: string };
    payments?: { captures?: { id: string; status: string }[] };
  }[];
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
};

export async function createOrder(params: {
  offerSlug: string;
  offerName: string;
  amountEuros: number;
  returnUrl: string;
  cancelUrl: string;
  customId: string;
}): Promise<{ order: PayPalOrder; approveUrl: string }> {
  const token = await accessToken();

  const response = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.offerSlug,
          custom_id: params.customId.slice(0, 127),
          description: params.offerName.slice(0, 127),
          amount: { currency_code: "EUR", value: params.amountEuros.toFixed(2) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Saphia",
            locale: "fr-FR",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            return_url: params.returnUrl,
            cancel_url: params.cancelUrl,
          },
        },
      },
    }),
  });

  const order = (await response.json()) as PayPalOrder & { message?: string };
  if (!response.ok) {
    throw new Error(order.message ?? `PayPal a répondu ${response.status}`);
  }

  const approveUrl = order.links?.find((link) => link.rel === "payer-action" || link.rel === "approve")
    ?.href;
  if (!approveUrl) throw new Error("Lien d'approbation PayPal introuvable");

  return { order, approveUrl };
}

export async function captureOrder(orderId: string): Promise<PayPalOrder> {
  const token = await accessToken();

  const response = await fetch(
    `${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const order = (await response.json()) as PayPalOrder & {
    message?: string;
    details?: { issue?: string }[];
  };

  // Un ordre déjà capturé n'est pas une erreur : on relit son état.
  if (!response.ok) {
    if (order.details?.some((detail) => detail.issue === "ORDER_ALREADY_CAPTURED")) {
      return getOrder(orderId);
    }
    throw new Error(order.message ?? `Capture PayPal échouée (${response.status})`);
  }

  return order;
}

export async function getOrder(orderId: string): Promise<PayPalOrder> {
  const token = await accessToken();
  const response = await fetch(
    `${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  const order = (await response.json()) as PayPalOrder & { message?: string };
  if (!response.ok) throw new Error(order.message ?? `PayPal a répondu ${response.status}`);
  return order;
}
