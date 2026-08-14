"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EBOOK_SLUG, ebook, formatPrice } from "@/content/site.config";
import { readAttribution, track } from "@/lib/analytics";
import { ebookSchema, fieldErrors } from "@/lib/validation";

/**
 * Achat de l'ebook (§19).
 *
 *  Ebook payant  : coordonnées → paiement → vérification serveur → téléchargement
 *  Ebook gratuit : coordonnées → envoi immédiat par email
 *
 * Comme pour les séances, le paiement est revérifié côté serveur au retour de
 * Stripe ou PayPal : le lien de téléchargement n'est délivré qu'ensuite.
 */

type Buyer = { firstName: string; email: string };

export function EbookPurchase() {
  const searchParams = useSearchParams();
  const isPaid = ebook.price > 0;

  const paymentParam = searchParams.get("payment");
  const provider = paymentParam === "stripe" ? "stripe" : paymentParam === "paypal" ? "paypal" : null;
  const cancelled = paymentParam === "cancelled";
  const reference = provider === "stripe" ? searchParams.get("session_id") : searchParams.get("token");

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"form" | "sending" | "payment" | "done" | "error">("form");
  const [message, setMessage] = useState<string | null>(null);
  const [download, setDownload] = useState<string | null>(null);
  const [pending, setPending] = useState<"stripe" | "paypal" | null>(null);

  const awaitingVerification = Boolean(provider && reference) && status !== "done" && status !== "error";

  /** Vérification du paiement au retour du fournisseur. */
  useEffect(() => {
    if (!provider || !reference) return;
    let active = true;

    fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, reference, offerSlug: EBOOK_SLUG }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          paid?: boolean;
          downloadUrl?: string;
          email?: string;
          error?: string;
        };
        if (!active) return;

        if (response.ok && payload.paid) {
          setDownload(payload.downloadUrl ?? null);
          setStatus("done");
          track("purchase", { product: "ebook", method: provider, value: ebook.price });
        } else {
          setMessage(payload.error ?? "Le paiement n'a pas pu être confirmé.");
          setStatus("error");
          track("payment_failed", { product: "ebook", method: provider });
        }
      })
      .catch(() => {
        if (!active) return;
        setMessage("Impossible de vérifier le paiement pour le moment. Merci de réessayer.");
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [provider, reference]);

  const priceLabel = useMemo(() => formatPrice(ebook.price), []);

  // Le retour d'un paiement abandonné se déduit de l'URL : inutile de le
  // recopier dans un état.
  const notice =
    message ??
    (cancelled
      ? "Le paiement a été interrompu — aucune somme n'a été débitée. Tu peux réessayer quand tu veux."
      : null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = ebookSchema.safeParse({
      firstName: String(formData.get("firstName") ?? ""),
      email: String(formData.get("email") ?? ""),
      consent: formData.get("consent") === "on",
      website: String(formData.get("website") ?? ""),
      attribution: readAttribution(),
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    const nextBuyer = { firstName: parsed.data.firstName, email: parsed.data.email };
    setBuyer(nextBuyer);

    if (isPaid) {
      setStatus("payment");
      setMessage(null);
      track("begin_checkout", { product: "ebook", value: ebook.price });
      return;
    }

    // Ebook gratuit : envoi direct par email.
    setStatus("sending");
    track("ebook_download", { product: "ebook", value: 0 });

    try {
      const response = await fetch("/api/ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await response.json()) as { ok?: boolean; downloadUrl?: string | null };

      if (!response.ok || !payload.ok) {
        setMessage("L'envoi a échoué. Réessaie dans un instant, ou écris-moi.");
        setStatus("error");
        return;
      }

      setDownload(payload.downloadUrl ?? null);
      setStatus("done");
    } catch {
      setMessage("Connexion impossible. Vérifie ta connexion internet et réessaie.");
      setStatus("error");
    }
  }

  async function startCheckout(method: "stripe" | "paypal") {
    if (!buyer) return;
    setPending(method);
    setMessage(null);
    track("select_payment_method", { product: "ebook", method });

    try {
      const response = await fetch(`/api/checkout/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerSlug: EBOOK_SLUG,
          email: buyer.email,
          firstName: buyer.firstName,
          // L'ebook ne demande pas le nom de famille : on renseigne le prénom.
          lastName: buyer.firstName,
        }),
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        setMessage(payload.error ?? "Le paiement n'a pas pu être initialisé.");
        track("payment_failed", { product: "ebook", method });
        return;
      }

      window.location.href = payload.url;
    } catch {
      setMessage("Connexion impossible. Vérifie ta connexion internet et réessaie.");
    } finally {
      setPending(null);
    }
  }

  /* ── Vérification du paiement en cours ─────────────────────────────────── */
  if (awaitingVerification) {
    return (
      <div className="card p-7 text-center md:p-9">
        <p role="status" className="text-sm text-plum">
          Vérification de ton paiement en cours… Merci de ne pas fermer cette page.
        </p>
      </div>
    );
  }

  /* ── Achat confirmé ────────────────────────────────────────────────────── */
  if (status === "done") {
    return (
      <div className="card p-7 text-center md:p-9">
        <span
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-plum text-2xl text-cream"
        >
          ✓
        </span>
        <h3 className="mt-5 font-display text-xl text-ink">Ton ebook est à toi</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Le lien vient aussi de partir par email — garde-le, il te permettra de retélécharger le
          guide quand tu veux.
        </p>
        {download ? (
          <a
            href={download}
            className="btn btn-primary mt-6 w-full"
            onClick={() => track("ebook_download", { product: "ebook" })}
          >
            Télécharger maintenant
          </a>
        ) : null}
        <Link href="/reserver/appel-decouverte" className="btn btn-secondary mt-2 w-full">
          Réserver 30 minutes gratuitement
        </Link>
      </div>
    );
  }

  /* ── Choix du moyen de paiement ────────────────────────────────────────── */
  if (status === "payment" && buyer) {
    return (
      <div className="card p-7 md:p-9">
        <h3 className="font-display text-xl text-ink">Choisis ton moyen de paiement</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {ebook.title} — <strong className="text-ink">{priceLabel}</strong>. Le lien de
          téléchargement t&apos;est envoyé immédiatement après le paiement, à l&apos;adresse{" "}
          <strong className="text-ink">{buyer.email}</strong>.
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

        {notice ? (
          <p role="alert" className="mt-5 rounded-2xl bg-clay-soft p-4 text-sm text-ink">
            {notice}
          </p>
        ) : null}

        <p className="mt-6 text-xs leading-relaxed text-muted">
          Il s&apos;agit d&apos;un contenu numérique livré immédiatement : en validant ton achat, tu
          demandes son exécution immédiate et renonces à ton droit de rétractation de 14 jours.{" "}
          <Link href="/cgv" className="text-plum underline">
            Conditions générales
          </Link>
          .
        </p>

        <button
          type="button"
          onClick={() => setStatus("form")}
          className="mt-5 text-sm text-muted underline underline-offset-4 hover:text-plum"
        >
          Modifier mes informations
        </button>
      </div>
    );
  }

  /* ── Formulaire ────────────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate className="card p-7 md:p-9">
      <h3 className="font-display text-xl text-ink">
        {isPaid ? `Obtenir l'ebook — ${priceLabel}` : "Recevoir l'ebook gratuitement"}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {isPaid
          ? "Indique ton prénom et ton email : tu recevras le lien de téléchargement juste après le paiement."
          : "Indique ton prénom et ton email : tu reçois le lien de téléchargement immédiatement."}
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="ebook-firstName" className="field-label">
            Prénom <span className="text-clay">*</span>
          </label>
          <input
            id="ebook-firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            className="field-input"
            aria-invalid={Boolean(errors.firstName)}
          />
          {errors.firstName ? <p className="field-error">{errors.firstName}</p> : null}
        </div>

        <div>
          <label htmlFor="ebook-email" className="field-label">
            Email <span className="text-clay">*</span>
          </label>
          <input
            id="ebook-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className="field-input"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <p className="field-error">{errors.email}</p>
          ) : (
            <p className="field-hint">C&apos;est à cette adresse que l&apos;ebook sera envoyé.</p>
          )}
        </div>

        {/* Champ piège anti-spam, masqué aux lecteurs d'écran. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="ebook-website">Ne pas remplir</label>
          <input id="ebook-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 flex-none accent-[#5b3a4a]" />
            <span className="text-sm leading-relaxed text-muted">
              J&apos;accepte de recevoir l&apos;ebook par email. Je peux me désinscrire à tout
              moment.{" "}
              <Link href="/politique-de-confidentialite" className="text-plum underline">
                Politique de confidentialité
              </Link>
              . <span className="text-clay">*</span>
            </span>
          </label>
          {errors.consent ? <p className="field-error">{errors.consent}</p> : null}
        </div>
      </div>

      {notice ? (
        <p role="alert" className="mt-5 rounded-2xl bg-clay-soft p-4 text-sm leading-relaxed text-ink">
          {notice}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary mt-7 w-full disabled:opacity-60"
      >
        {status === "sending"
          ? "Envoi en cours…"
          : isPaid
            ? `Continuer vers le paiement — ${priceLabel}`
            : "Recevoir l'ebook"}
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        Paiement sécurisé par carte bancaire ou PayPal. Aucune donnée bancaire n&apos;est stockée par
        le site.
      </p>
    </form>
  );
}
