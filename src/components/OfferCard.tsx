"use client";

import Link from "next/link";
import type { Offer, Program } from "@/content/site.config";
import { formatDuration, formatPrice } from "@/content/site.config";
import { track } from "@/lib/analytics";
import { Pill } from "@/components/ui";

/** Carte d'une prestation à l'unité (§7, §9). */
export function OfferCard({ offer, highlight = false }: { offer: Offer; highlight?: boolean }) {
  const free = offer.price === 0;

  return (
    <article
      className={`card flex h-full flex-col p-6 transition-transform duration-200 hover:-translate-y-1 md:p-8 ${
        highlight ? "ring-2 ring-plum/25" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <Pill tone={free ? "clay" : "plum"}>{formatDuration(offer.durationMinutes)}</Pill>
        {free ? <Pill tone="plum">Sans engagement</Pill> : null}
      </div>

      <h3 className="mt-5 text-2xl text-ink">{offer.name}</h3>
      <p className="mt-1 text-sm font-medium text-clay">{offer.tagline}</p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{offer.shortDescription}</p>

      <p className="mt-6 font-display text-3xl text-plum">{formatPrice(offer.price)}</p>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href={`/reserver/${offer.slug}`}
          onClick={() => track("click_reserve", { offer: offer.slug, price: offer.price })}
          className="btn btn-primary w-full"
        >
          {free ? "Réserver" : "Réserver & payer"}
        </Link>
        <Link
          href={`/accompagnements/${offer.slug}`}
          onClick={() => track("view_offer", { offer: offer.slug })}
          className="btn btn-secondary w-full"
        >
          En savoir plus
        </Link>
      </div>
    </article>
  );
}

/** Carte d'un accompagnement longue durée (§6). */
export function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="card flex h-full flex-col p-6 transition-transform duration-200 hover:-translate-y-1 md:p-8">
      <Pill tone="plum">{program.duration}</Pill>
      <h3 className="mt-5 text-2xl text-ink">{program.name}</h3>
      <p className="mt-1 text-sm font-medium text-clay">{program.tagline}</p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{program.description}</p>

      <p className="mt-6 font-display text-xl text-plum">
        {program.priceLabel ?? "Tarif défini lors de l'appel découverte"}
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href="/reserver/appel-decouverte"
          onClick={() => track("click_reserve", { offer: program.slug })}
          className="btn btn-primary w-full"
        >
          Commencer mon accompagnement
        </Link>
        <Link
          href={`/accompagnements/${program.slug}`}
          onClick={() => track("view_offer", { offer: program.slug })}
          className="btn btn-secondary w-full"
        >
          En savoir plus
        </Link>
      </div>
    </article>
  );
}
