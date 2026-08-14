/**
 * Suivi des événements du tunnel de conversion (§39 du PRD).
 *
 * Deux fournisseurs sont supportés, activés par variables d'environnement :
 *  - Google Analytics 4  → NEXT_PUBLIC_GA_ID
 *  - Plausible           → NEXT_PUBLIC_PLAUSIBLE_DOMAIN
 *
 * Si aucun n'est configuré, `track()` ne fait rien : le site fonctionne
 * normalement, sans script tiers ni cookie.
 */

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/** Événements suivis sur l'ensemble du tunnel. */
export type AnalyticsEvent =
  | "view_offer"
  | "click_reserve"
  | "start_booking"
  | "submit_prebooking_form"
  | "select_payment_method"
  | "begin_checkout"
  | "purchase"
  | "payment_failed"
  | "booking_completed"
  | "ebook_view"
  | "ebook_download"
  | "contact_whatsapp"
  | "contact_form_submit"
  | "click_social";

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
    plausible?: (event: string, options?: { props?: AnalyticsPayload }) => void;
  }
}

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as AnalyticsPayload;

  try {
    window.gtag?.("event", event, cleaned);
    window.plausible?.(event, Object.keys(cleaned).length ? { props: cleaned } : undefined);
  } catch {
    // Le suivi ne doit jamais casser le parcours utilisateur.
  }
}

/**
 * Récupère les paramètres UTM présents dans l'URL, afin d'attribuer
 * les réservations à leur source (TikTok, Linktree, Instagram…).
 */
export function readAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];
  const attribution: Record<string, string> = {};
  for (const key of keys) {
    const value = params.get(key);
    if (value) attribution[key] = value.slice(0, 100);
  }
  return attribution;
}
