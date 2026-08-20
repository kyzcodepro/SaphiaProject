"use client";

import { useState } from "react";
import { bookingRules, formatPrice } from "@/content/site.config";
import { track } from "@/lib/analytics";

/**
 * Choix du moyen de paiement (§12, §34).
 *
 * Le paiement précède la sélection du créneau : tant qu'il n'est pas validé,
 * aucune réservation n'est confirmée (§11).
 */

type Customer = { email: string; firstName: string; lastName: string };

export function PaymentStep({
  offerSlug,
  offerName,
  price,
  customer,
  onBack,
}: {
  offerSlug: string;
  offerName: string;
  price: number;
  customer: Customer;
  onBack: () => void;
}) {
  const [pending, setPending] = useState<"stripe" | "paypal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(provider: "stripe" | "paypal") {
    setPending(provider);
    setError(null);
    track("select_payment_method", { offer: offerSlug, method: provider });

    try {
      const response = await fetch(`/api/checkout/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerSlug, ...customer }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setError(
          payload.error ??
            "Le paiement n'a pas pu être initialisé. Merci de réessayer ou de me contacter.",
        );
        track("payment_failed", { offer: offerSlug, method: provider });
        return;
      }

      track("begin_checkout", { offer: offerSlug, method: provider, value: price });
      window.location.href = payload.url;
    } catch {
      setError("Connexion impossible. Vérifie ta connexion internet et réessaie.");
      track("payment_failed", { offer: offerSlug, method: provider });
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Choisis ton moyen de paiement</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {offerName} — <strong className="text-ink">{formatPrice(price)}</strong>. Le règlement est
        nécessaire avant de choisir ton créneau : ta réservation ne sera confirmée qu&apos;une fois
        le paiement validé.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => startCheckout("stripe")}
          disabled={pending !== null}
          className="btn btn-primary w-full disabled:opacity-60"
        >
          {pending === "stripe" ? "Redirection…" : "Carte bancaire"}
        </button>
        <button
          type="button"
          onClick={() => startCheckout("paypal")}
          disabled={pending !== null}
          className="btn w-full border border-[#003087]/25 bg-[#ffc439] text-[#003087] hover:bg-[#f0b429] disabled:opacity-60"
        >
          {pending === "paypal" ? "Redirection…" : "PayPal"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl bg-clay-soft p-4 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <ul className="mt-7 space-y-2 text-sm text-muted">
        <li>Paiement sécurisé — aucune donnée bancaire n&apos;est stockée par le site.</li>
        <li>Un reçu t&apos;est envoyé automatiquement par email.</li>
        <li>Report possible jusqu&apos;à {bookingRules.cancellationNoticeHours} h avant la séance.</li>
      </ul>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 text-sm text-muted underline underline-offset-4 hover:text-plum"
      >
        Revenir à mes informations
      </button>
    </div>
  );
}
