"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { PaymentStep } from "@/components/booking/PaymentStep";
import { PrebookingForm, type PrebookingResult } from "@/components/booking/PrebookingForm";
import { sessionPayment } from "@/content/site.config";
import { readAttribution, track } from "@/lib/analytics";

/**
 * Orchestration du parcours de réservation (§10, §11).
 *
 *  Offre gratuite : informations → créneau → confirmation
 *  Offre payante  : selon `sessionPayment` (voir site.config.ts)
 *      "calendly" → informations → créneau (Calendly encaisse) → confirmation
 *      "site"     → informations → paiement → créneau → confirmation
 *
 * Dans les deux cas, aucun rendez-vous ne peut être confirmé sans paiement.
 * En mode "site", le paiement est relu côté serveur auprès de Stripe ou PayPal
 * avant l'affichage du calendrier ; en mode "calendly", c'est Calendly qui
 * refuse de créer le rendez-vous tant que le règlement n'est pas passé (§11).
 */

export type BookingOffer = {
  slug: string;
  name: string;
  price: number;
  durationLabel: string;
  calendlyEvent: string;
};

type Step = "form" | "payment" | "schedule";

type Verification = { paid: boolean; reference?: string; error?: string };

const STORAGE_PREFIX = "saphia.booking.";

const CANCELLED_NOTICE =
  "Le paiement a été interrompu — aucune somme n'a été débitée et aucun rendez-vous n'a été réservé. Tu peux réessayer quand tu veux.";

const DEFAULT_FAILURE_NOTICE =
  "Le paiement n'a pas pu être confirmé. Si une somme a été débitée, contacte-moi et je régularise immédiatement.";

/* Les informations saisies avant la redirection vers Stripe ou PayPal vivent
   dans sessionStorage. On les lit comme une source externe plutôt que de les
   recopier dans un état au montage. */
const noopSubscribe = () => () => {};

function readStoredCustomer(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    // sessionStorage indisponible (navigation privée) : le formulaire sera
    // simplement à ressaisir.
    return null;
  }
}

export function BookingFlow({ offer }: { offer: BookingOffer }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storageKey = `${STORAGE_PREFIX}${offer.slug}`;
  const isFree = offer.price === 0;
  /** Le site n'encaisse que si la configuration le lui demande. */
  const chargesOnSite = !isFree && sessionPayment === "site";

  const paymentParam = searchParams.get("payment");
  const provider = paymentParam === "stripe" ? "stripe" : paymentParam === "paypal" ? "paypal" : null;
  const cancelled = paymentParam === "cancelled";
  const reference = provider === "stripe" ? searchParams.get("session_id") : searchParams.get("token");

  const [verification, setVerification] = useState<Verification | null>(null);
  const [stepOverride, setStepOverride] = useState<Step | null>(null);
  const [enteredCustomer, setEnteredCustomer] = useState<PrebookingResult | null>(null);

  const storedRaw = useSyncExternalStore(
    noopSubscribe,
    () => readStoredCustomer(storageKey),
    () => null,
  );

  const customer = useMemo(() => {
    if (enteredCustomer) return enteredCustomer;
    if (!storedRaw) return null;
    try {
      return JSON.parse(storedRaw) as PrebookingResult;
    } catch {
      return null;
    }
  }, [enteredCustomer, storedRaw]);

  const awaitingVerification = Boolean(provider && reference) && verification === null;

  /** L'étape courante se déduit de l'URL et des actions déjà effectuées. */
  const step: Step =
    stepOverride ??
    (!chargesOnSite
      ? "form"
      : verification?.paid
        ? "schedule"
        : cancelled || verification || awaitingVerification
          ? "payment"
          : "form");

  const notice = stepOverride || !chargesOnSite
    ? null
    : cancelled
      ? CANCELLED_NOTICE
      : verification && !verification.paid
        ? (verification.error ?? DEFAULT_FAILURE_NOTICE)
        : null;

  useEffect(() => {
    track("start_booking", { offer: offer.slug, price: offer.price });
  }, [offer.slug, offer.price]);

  useEffect(() => {
    if (cancelled) track("payment_failed", { offer: offer.slug, reason: "cancelled" });
  }, [cancelled, offer.slug]);

  /** Vérification du paiement au retour de Stripe ou PayPal (mode "site"). */
  useEffect(() => {
    if (!chargesOnSite || !provider || !reference) return;

    let active = true;

    fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, reference, offerSlug: offer.slug }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as Verification;
        if (!active) return;

        if (response.ok && payload.paid) {
          setVerification({ paid: true, reference: payload.reference ?? reference });
          track("purchase", { offer: offer.slug, method: provider, value: offer.price });
        } else {
          setVerification({ paid: false, error: payload.error });
          track("payment_failed", { offer: offer.slug, method: provider });
        }
      })
      .catch(() => {
        if (!active) return;
        setVerification({
          paid: false,
          error: "Impossible de vérifier le paiement pour le moment. Merci de réessayer.",
        });
      });

    return () => {
      active = false;
    };
  }, [chargesOnSite, provider, reference, offer.slug, offer.price]);

  const handleFormCompleted = useCallback(
    (data: PrebookingResult) => {
      setEnteredCustomer(data);
      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        // Sans sessionStorage, le parcours reste fonctionnel dans cet onglet.
      }
      setStepOverride(chargesOnSite ? "payment" : "schedule");
    },
    [chargesOnSite, storageKey],
  );

  const handleScheduled = useCallback(() => {
    track("booking_completed", { offer: offer.slug, value: offer.price, paid: !isFree });
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Rien à nettoyer.
    }
    router.push(`/reservation-confirmee?offre=${offer.slug}`);
  }, [isFree, offer.price, offer.slug, router, storageKey]);

  const calendlyPrefill = useMemo(
    () =>
      customer
        ? {
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            email: customer.email,
          }
        : undefined,
    [customer],
  );

  const calendlyUtm = useMemo(() => {
    const attribution = readAttribution();
    const paymentReference = verification?.paid ? verification.reference : undefined;
    return {
      utm_source: attribution.utm_source ?? "site",
      utm_medium: attribution.utm_medium ?? "reservation",
      utm_campaign: attribution.utm_campaign ?? offer.slug,
      ...(paymentReference ? { utm_content: paymentReference.slice(0, 60) } : {}),
    };
  }, [offer.slug, verification]);

  const steps = chargesOnSite
    ? ["Tes informations", "Paiement", "Ton créneau"]
    : ["Tes informations", "Ton créneau"];
  const currentIndex = step === "form" ? 0 : step === "payment" ? 1 : steps.length - 1;

  return (
    <div>
      {/* Fil d'étapes */}
      <ol className="mb-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-label="Étapes">
        {steps.map((label, index) => {
          const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "todo";
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                aria-current={state === "current" ? "step" : undefined}
                className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 font-medium ${
                  state === "current"
                    ? "bg-plum text-cream"
                    : state === "done"
                      ? "bg-plum-soft text-plum"
                      : "bg-sand text-muted"
                }`}
              >
                <span aria-hidden="true">{state === "done" ? "✓" : index + 1}</span>
                {label}
              </span>
              {index < steps.length - 1 ? (
                <span aria-hidden="true" className="h-px w-4 bg-sand-deep sm:w-8" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {notice ? (
        <p role="alert" className="mb-8 rounded-2xl bg-clay-soft p-4 text-sm leading-relaxed text-ink">
          {notice}
        </p>
      ) : null}

      {awaitingVerification && !stepOverride ? (
        <p role="status" className="rounded-2xl bg-plum-soft p-5 text-sm text-plum">
          Vérification de ton paiement en cours… Merci de ne pas fermer cette page.
        </p>
      ) : (
        <>
          {step === "form" ? (
            <PrebookingForm
              offerSlug={offer.slug}
              offerPrice={offer.price}
              submitLabel={chargesOnSite ? "Continuer vers le paiement" : "Choisir mon créneau"}
              onCompleted={handleFormCompleted}
            />
          ) : null}

          {step === "payment" ? (
            customer ? (
              <PaymentStep
                offerSlug={offer.slug}
                offerName={offer.name}
                price={offer.price}
                customer={{
                  email: customer.email,
                  firstName: customer.firstName,
                  lastName: customer.lastName,
                }}
                onBack={() => setStepOverride("form")}
              />
            ) : (
              <div className="card p-6">
                <p className="text-sm leading-relaxed text-muted">
                  Tes informations n&apos;ont pas pu être retrouvées dans ce navigateur. Merci de les
                  saisir à nouveau pour reprendre la réservation.
                </p>
                <button
                  type="button"
                  onClick={() => setStepOverride("form")}
                  className="btn btn-primary mt-5"
                >
                  Reprendre
                </button>
              </div>
            )
          ) : null}

          {step === "schedule" ? (
            <div>
              <h2 className="font-display text-2xl text-ink">Choisis ta date et ton horaire</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {isFree
                  ? "Dernière étape : sélectionne le créneau qui t'arrange. Tu recevras la confirmation et les rappels par email."
                  : chargesOnSite
                    ? "Paiement confirmé. Sélectionne maintenant le créneau qui t'arrange — tu recevras la confirmation et les rappels par email."
                    : "Dernière étape : choisis ton créneau et règle la séance. Le rendez-vous est confirmé dès le paiement validé, et tu reçois la confirmation ainsi que les rappels par email."}
              </p>

              <CalendlyEmbed
                className="mt-6"
                eventSlug={offer.calendlyEvent}
                prefill={calendlyPrefill}
                utm={calendlyUtm}
                onScheduled={handleScheduled}
              />

              <p className="mt-6 text-center text-sm text-muted">
                Ton rendez-vous est confirmé ?{" "}
                <button
                  type="button"
                  onClick={handleScheduled}
                  className="text-plum underline underline-offset-4"
                >
                  Continuer
                </button>
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
