"use client";

import Link from "next/link";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { GA_ID } from "@/lib/analytics";

const STORAGE_KEY = "saphia.consent";

type Consent = "granted" | "denied" | null;

/* Petit magasin externe autour de localStorage : le choix de consentement vit
   hors de React, on s'y abonne plutôt que de le recopier dans un état local. */

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // localStorage indisponible : on considère qu'aucun choix n'a été fait.
    return null;
  }
}

function writeConsent(choice: Exclude<Consent, null>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Le choix ne sera pas mémorisé, mais il est appliqué pour cette visite.
  }
  for (const listener of listeners) listener();
}

/**
 * Bandeau de consentement (§40).
 *
 * N'apparaît que si Google Analytics est activé — Plausible ne dépose aucun
 * cookie et ne requiert donc pas de consentement. Tant que le visiteur n'a pas
 * accepté, GA reste en mode « consent denied » (aucune mesure).
 */
export function CookieBanner() {
  const consent = useSyncExternalStore<Consent>(subscribe, readConsent, () => null);

  // Répercute le choix mémorisé auprès de Google Analytics (système externe).
  useEffect(() => {
    if (!GA_ID || !consent) return;
    window.gtag?.("consent", "update", { analytics_storage: consent });
  }, [consent]);

  const decide = useCallback((choice: Exclude<Consent, null>) => {
    writeConsent(choice);
  }, []);

  if (!GA_ID || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Gestion des cookies"
      className="fixed inset-x-3 bottom-3 z-50 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md"
    >
      <div className="card p-5">
        <p className="text-sm text-muted">
          J&apos;utilise des cookies de mesure d&apos;audience pour comprendre comment le site est
          consulté. Tu peux refuser sans perdre aucune fonctionnalité.{" "}
          <Link href="/politique-de-cookies" className="text-plum underline">
            En savoir plus
          </Link>
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => decide("granted")} className="btn btn-primary flex-1">
            Accepter
          </button>
          <button type="button" onClick={() => decide("denied")} className="btn btn-secondary flex-1">
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}
