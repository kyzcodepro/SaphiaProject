"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calendly } from "@/content/site.config";

/**
 * Intégration Calendly en mode « inline widget » (§32).
 *
 * Le visiteur choisit sa date et son horaire sans quitter le site. Les règles
 * de réservation (24 h de délai, buffer de 15 min, disponibilités lundi-samedi)
 * sont appliquées par Calendly — voir docs/ADMINISTRATION.md.
 *
 * `onScheduled` est déclenché lorsque Calendly confirme la prise de rendez-vous,
 * ce qui permet de rediriger vers la page de confirmation personnalisée (§22).
 */

type CalendlyPrefill = {
  name?: string;
  email?: string;
  /** Réponses aux questions personnalisées de l'événement : a1, a2, a3… */
  customAnswers?: Record<string, string>;
};

type CalendlyEmbedProps = {
  eventSlug: string;
  prefill?: CalendlyPrefill;
  /** Paramètres UTM transmis à Calendly pour l'attribution (§39). */
  utm?: Record<string, string>;
  onScheduled?: () => void;
  className?: string;
};

const WIDGET_SCRIPT = "https://assets.calendly.com/assets/external/widget.js";

/**
 * Chargement du script Calendly, mutualisé entre toutes les instances du
 * composant : il n'est injecté qu'une seule fois par session de navigation.
 */
let widgetScriptPromise: Promise<void> | null = null;

function loadWidgetScript(): Promise<void> {
  if (widgetScriptPromise) return widgetScriptPromise;

  widgetScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SCRIPT}"]`);
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Script Calendly indisponible")));

    if (!existing) {
      script.src = WIDGET_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
  });

  return widgetScriptPromise;
}

function buildUrl(eventSlug: string, prefill?: CalendlyPrefill, utm?: Record<string, string>) {
  const url = new URL(`https://calendly.com/${calendly.username}/${eventSlug}`);
  const params = url.searchParams;

  params.set("hide_gdpr_banner", "1");
  params.set("hide_landing_page_details", "1");
  params.set("background_color", calendly.widget.backgroundColor);
  params.set("primary_color", calendly.widget.primaryColor);
  params.set("text_color", calendly.widget.textColor);

  if (prefill?.name) params.set("name", prefill.name);
  if (prefill?.email) params.set("email", prefill.email);
  for (const [key, value] of Object.entries(prefill?.customAnswers ?? {})) {
    if (value) params.set(key, value);
  }
  for (const [key, value] of Object.entries(utm ?? {})) {
    if (value) params.set(key, value);
  }

  return url.toString();
}

export function CalendlyEmbed({
  eventSlug,
  prefill,
  utm,
  onScheduled,
  className = "",
}: CalendlyEmbedProps) {
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const url = useMemo(() => buildUrl(eventSlug, prefill, utm), [eventSlug, prefill, utm]);

  useEffect(() => {
    let active = true;
    loadWidgetScript()
      .then(() => {
        if (active) setScriptReady(true);
      })
      .catch(() => {
        if (active) setScriptFailed(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // (Ré)initialisation du widget quand l'URL change.
  useEffect(() => {
    if (!scriptReady || !containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = "";

    const calendlyApi = (
      window as unknown as {
        Calendly?: { initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void };
      }
    ).Calendly;

    calendlyApi?.initInlineWidget({ url, parentElement: container });
  }, [scriptReady, url]);

  // Écoute la confirmation de rendez-vous envoyée par l'iframe Calendly.
  useEffect(() => {
    if (!onScheduled) return;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== "https://calendly.com") return;
      const data = event.data as { event?: string } | undefined;
      if (data?.event === "calendly.event_scheduled") onScheduled?.();
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onScheduled]);

  if (scriptFailed) {
    return (
      <div className={`card p-6 text-center ${className}`}>
        <p className="text-sm text-muted">
          Le calendrier n&apos;a pas pu se charger. Tu peux ouvrir la page de réservation
          directement :
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-4 w-full sm:w-auto"
        >
          Ouvrir le calendrier
        </a>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="min-h-[720px] w-full overflow-hidden rounded-[1.75rem] border border-sand-deep/60 bg-white md:min-h-[700px]"
      />
      {!scriptReady ? (
        <p className="mt-4 text-center text-sm text-muted" role="status">
          Chargement du calendrier…
        </p>
      ) : null}
      <noscript>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4">
          Ouvrir le calendrier de réservation
        </a>
      </noscript>
    </div>
  );
}
