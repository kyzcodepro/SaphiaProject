"use client";

import Link from "next/link";
import { useState } from "react";
import { readAttribution, track } from "@/lib/analytics";
import {
  familySituations,
  fieldErrors,
  prebookingSchema,
  professionalSituations,
  type PrebookingInput,
} from "@/lib/validation";

/**
 * Questionnaire préalable à la réservation (§15).
 *
 * Seuls prénom, nom, email, mode de rendez-vous et consentement sont
 * obligatoires. Les questions sur la situation familiale ou professionnelle
 * restent facultatives (minimisation des données, §40).
 */

const familyLabels: Record<(typeof familySituations)[number], string> = {
  celibataire: "Célibataire",
  "en-couple": "En couple",
  marie: "Marié(e)",
  separe: "Séparé(e)",
  parent: "Parent",
  "non-communique": "Je préfère ne pas répondre",
};

const professionalLabels: Record<(typeof professionalSituations)[number], string> = {
  salarie: "Salarié(e)",
  entrepreneur: "Entrepreneur(e)",
  etudiant: "Étudiant(e)",
  "recherche-emploi": "En recherche d'emploi",
  autre: "Autre",
  "non-communique": "Je préfère ne pas répondre",
};

export type PrebookingResult = PrebookingInput;

export function PrebookingForm({
  offerSlug,
  offerPrice,
  submitLabel,
  onCompleted,
}: {
  offerSlug: string;
  offerPrice: number;
  submitLabel: string;
  onCompleted: (data: PrebookingResult) => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const raw = {
      offerSlug,
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      meetingMode: String(formData.get("meetingMode") ?? ""),
      familySituation: String(formData.get("familySituation") ?? "") || undefined,
      childrenCount: String(formData.get("childrenCount") ?? ""),
      professionalSituation: String(formData.get("professionalSituation") ?? "") || undefined,
      goal: String(formData.get("goal") ?? ""),
      blocker: String(formData.get("blocker") ?? ""),
      expectations: String(formData.get("expectations") ?? ""),
      extra: String(formData.get("extra") ?? ""),
      consent: formData.get("consent") === "on",
      attribution: readAttribution(),
    };

    const parsed = prebookingSchema.safeParse(raw);
    if (!parsed.success) {
      const found = fieldErrors(parsed.error);
      setErrors(found);
      const firstField = Object.keys(found)[0];
      document.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    track("submit_prebooking_form", { offer: offerSlug, price: offerPrice });

    try {
      // Transmet le questionnaire à l'accompagnatrice. Un échec d'envoi ne doit
      // pas empêcher la réservation : le parcours continue dans tous les cas.
      await fetch("/api/prebooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      }).catch(() => null);

      onCompleted(parsed.data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ink">Tes informations</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="field-label">
              Prénom <span className="text-clay">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              className="field-input"
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
            />
            {errors.firstName ? (
              <p id="firstName-error" className="field-error">
                {errors.firstName}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="lastName" className="field-label">
              Nom <span className="text-clay">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              className="field-input"
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
            />
            {errors.lastName ? (
              <p id="lastName-error" className="field-error">
                {errors.lastName}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="field-label">
              Email <span className="text-clay">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              className="field-input"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : "email-hint"}
            />
            {errors.email ? (
              <p id="email-error" className="field-error">
                {errors.email}
              </p>
            ) : (
              <p id="email-hint" className="field-hint">
                Tu y recevras la confirmation et les rappels.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="field-label">
              Téléphone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={24}
              className="field-input"
              placeholder="06 12 34 56 78"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
            />
            {errors.phone ? (
              <p id="phone-error" className="field-error">
                {errors.phone}
              </p>
            ) : (
              <p id="phone-hint" className="field-hint">
                Numéro français, nécessaire si tu choisis un échange par WhatsApp.
              </p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="font-display text-xl text-ink">
          Comment souhaites-tu échanger ? <span className="text-clay">*</span>
        </legend>
        <p className="mt-1 text-sm text-muted">
          Le lien Zoom ou les instructions WhatsApp te seront envoyés avec la confirmation.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { value: "zoom", title: "Zoom", text: "Visioconférence, lien envoyé automatiquement" },
            { value: "whatsapp", title: "WhatsApp", text: "Appel audio ou vidéo via WhatsApp" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-sand-deep bg-white p-4 transition-colors has-checked:border-plum has-checked:bg-plum-soft"
            >
              <input
                type="radio"
                name="meetingMode"
                value={option.value}
                required
                className="mt-1 h-4 w-4 accent-[#5b3a4a]"
              />
              <span>
                <span className="block font-semibold text-ink">{option.title}</span>
                <span className="block text-sm text-muted">{option.text}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.meetingMode ? <p className="field-error">{errors.meetingMode}</p> : null}
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-display text-xl text-ink">Pour préparer notre échange</legend>
        <p className="-mt-1 text-sm text-muted">
          Ces questions sont facultatives. Réponds uniquement à ce qui te semble utile.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="familySituation" className="field-label">
              Situation familiale
            </label>
            <select id="familySituation" name="familySituation" className="field-input" defaultValue="">
              <option value="">Sans réponse</option>
              {familySituations.map((value) => (
                <option key={value} value={value}>
                  {familyLabels[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="childrenCount" className="field-label">
              Nombre d&apos;enfants
            </label>
            <input
              id="childrenCount"
              name="childrenCount"
              type="text"
              inputMode="numeric"
              className="field-input"
              placeholder="Facultatif"
            />
          </div>
        </div>

        <div>
          <label htmlFor="professionalSituation" className="field-label">
            Situation professionnelle
          </label>
          <select
            id="professionalSituation"
            name="professionalSituation"
            className="field-input"
            defaultValue=""
          >
            <option value="">Sans réponse</option>
            {professionalSituations.map((value) => (
              <option key={value} value={value}>
                {professionalLabels[value]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="goal" className="field-label">
            Qu&apos;aimerais-tu améliorer ou changer actuellement ?
          </label>
          <textarea id="goal" name="goal" rows={3} className="field-input" />
        </div>

        <div>
          <label htmlFor="blocker" className="field-label">
            Quel est actuellement ton principal blocage ?
          </label>
          <textarea id="blocker" name="blocker" rows={3} className="field-input" />
        </div>

        <div>
          <label htmlFor="expectations" className="field-label">
            Qu&apos;attends-tu de cet accompagnement ?
          </label>
          <textarea id="expectations" name="expectations" rows={3} className="field-input" />
        </div>

        <div>
          <label htmlFor="extra" className="field-label">
            Y a-t-il quelque chose que tu souhaites me préciser avant notre échange ?
          </label>
          <textarea id="extra" name="extra" rows={3} className="field-input" />
        </div>
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="consent"
            className="mt-1 h-4 w-4 flex-none accent-[#5b3a4a]"
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span className="text-sm leading-relaxed text-muted">
            J&apos;accepte que ces informations soient utilisées pour préparer et organiser mon
            rendez-vous. Elles restent confidentielles et ne sont jamais transmises à des tiers à
            des fins commerciales.{" "}
            <Link href="/politique-de-confidentialite" className="text-plum underline">
              Politique de confidentialité
            </Link>
            . <span className="text-clay">*</span>
          </span>
        </label>
        {errors.consent ? (
          <p id="consent-error" className="field-error">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
        {submitting ? "Un instant…" : submitLabel}
      </button>
    </form>
  );
}
