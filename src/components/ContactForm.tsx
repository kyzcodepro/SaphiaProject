"use client";

import Link from "next/link";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { contactSchema, fieldErrors } from "@/lib/validation";

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = contactSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      consent: formData.get("consent") === "on",
      website: String(formData.get("website") ?? ""),
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setStatus("sending");
    track("contact_form_submit");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      setStatus(response.ok ? "done" : "error");
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
        <h2 className="mt-5 font-display text-xl text-ink">Message envoyé</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Merci pour ton message. Je te réponds personnellement, généralement sous 48 heures
          ouvrées.
        </p>
        <Link href="/reserver/appel-decouverte" className="btn btn-secondary mt-6">
          Réserver un appel découverte
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-7 md:p-9">
      <div className="space-y-5">
        <div>
          <label htmlFor="contact-name" className="field-label">
            Nom <span className="text-clay">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="field-input"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="field-error">{errors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="contact-email" className="field-label">
            Email <span className="text-clay">*</span>
          </label>
          <input
            id="contact-email"
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

        <div>
          <label htmlFor="contact-subject" className="field-label">
            Sujet
          </label>
          <input id="contact-subject" name="subject" type="text" className="field-input" />
        </div>

        <div>
          <label htmlFor="contact-message" className="field-label">
            Ton message <span className="text-clay">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={6}
            required
            className="field-input"
            aria-invalid={Boolean(errors.message)}
          />
          {errors.message ? <p className="field-error">{errors.message}</p> : null}
        </div>

        {/* Champ piège anti-spam, masqué aux lecteurs d'écran. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="contact-website">Ne pas remplir</label>
          <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 flex-none accent-[#5b3a4a]" />
            <span className="text-sm leading-relaxed text-muted">
              J&apos;accepte que mes informations soient utilisées pour répondre à ma demande.{" "}
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
          Ton message n&apos;a pas pu être envoyé. Tu peux m&apos;écrire directement par email ou sur
          WhatsApp.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn btn-primary mt-7 w-full disabled:opacity-60"
      >
        {status === "sending" ? "Envoi en cours…" : "Envoyer mon message"}
      </button>
    </form>
  );
}
