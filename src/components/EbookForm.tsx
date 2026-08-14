"use client";

import Link from "next/link";
import { useState } from "react";
import { ebook, formatPrice } from "@/content/site.config";
import { readAttribution, track } from "@/lib/analytics";
import { ebookSchema, fieldErrors } from "@/lib/validation";

/**
 * Récupération de l'ebook (§19).
 *
 * Ebook gratuit : le lien de téléchargement s'affiche immédiatement et part
 * également par email. Ebook payant : la case est prévue pour brancher un
 * paiement Stripe (voir README, section « Ebook payant »).
 */
export function EbookForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

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

    setStatus("sending");
    track("ebook_download", { price: ebook.price });

    try {
      const response = await fetch("/api/ebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const payload = (await response.json()) as { ok?: boolean; downloadUrl?: string | null };

      if (!response.ok || !payload.ok) {
        setStatus("error");
        return;
      }

      setDownloadUrl(payload.downloadUrl ?? ebook.fileUrl);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="card p-7 text-center md:p-9">
        <span
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-plum text-2xl text-cream"
        >
          ✓
        </span>
        <h3 className="mt-5 font-display text-xl text-ink">C&apos;est envoyé !</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Le lien vient de partir par email. Tu peux aussi le télécharger tout de suite.
        </p>
        {downloadUrl ? (
          <a href={downloadUrl} download className="btn btn-primary mt-6 w-full">
            Télécharger l&apos;ebook
          </a>
        ) : null}
        <Link href="/reserver/appel-decouverte" className="btn btn-secondary mt-2 w-full">
          Réserver 30 minutes gratuitement
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-7 md:p-9">
      <h3 className="font-display text-xl text-ink">
        {ebook.price === 0 ? "Recevoir l'ebook gratuitement" : `Obtenir l'ebook — ${formatPrice(ebook.price)}`}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Indique ton prénom et ton email : tu reçois le lien de téléchargement immédiatement.
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
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
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
              J&apos;accepte de recevoir l&apos;ebook par email ainsi que d&apos;éventuels conseils.
              Je peux me désinscrire à tout moment.{" "}
              <Link href="/politique-de-confidentialite" className="text-plum underline">
                Politique de confidentialité
              </Link>
              . <span className="text-clay">*</span>
            </span>
          </label>
          {errors.consent ? <p className="field-error">{errors.consent}</p> : null}
        </div>
      </div>

      {status === "error" ? (
        <p role="alert" className="mt-5 rounded-2xl bg-clay-soft p-4 text-sm text-ink">
          L&apos;envoi a échoué. Réessaie dans un instant, ou écris-moi et je t&apos;envoie l&apos;ebook
          directement.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary mt-7 w-full disabled:opacity-60"
      >
        {status === "sending" ? "Envoi en cours…" : "Recevoir l'ebook"}
      </button>
    </form>
  );
}
