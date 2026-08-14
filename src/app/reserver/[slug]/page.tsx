import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { JsonLd } from "@/components/JsonLd";
import { Pill } from "@/components/ui";
import {
  bookingRules,
  formatDuration,
  formatPrice,
  getOffer,
  offers,
} from "@/content/site.config";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return offers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = getOffer(slug);
  if (!offer) return {};

  return pageMetadata({
    title: `Réserver — ${offer.name}`,
    description: `${offer.shortDescription} ${formatDuration(offer.durationMinutes)} · ${formatPrice(
      offer.price,
    )}.`,
    path: `/reserver/${offer.slug}`,
    // Les pages de tunnel ne sont pas indexées : elles n'ont pas d'intérêt SEO
    // et peuvent contenir des paramètres de paiement.
    noIndex: true,
  });
}

export default async function ReserverOffrePage({ params }: PageProps) {
  const { slug } = await params;
  const offer = getOffer(slug);
  if (!offer) notFound();

  const free = offer.price === 0;

  return (
    <>
      <div className="bg-cream">
        <div className="container-page py-12 md:py-16">
          <Link href="/reserver" className="text-sm text-muted underline underline-offset-4 hover:text-plum">
            ← Toutes les prestations
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
            {/* Parcours de réservation */}
            <div className="order-2 lg:order-1">
              <Suspense
                fallback={
                  <p role="status" className="text-sm text-muted">
                    Chargement du formulaire…
                  </p>
                }
              >
                <BookingFlow
                  offer={{
                    slug: offer.slug,
                    name: offer.name,
                    price: offer.price,
                    durationLabel: formatDuration(offer.durationMinutes),
                    calendlyEvent: offer.calendlyEvent,
                  }}
                />
              </Suspense>
            </div>

            {/* Récapitulatif */}
            <aside className="order-1 lg:order-2">
              <div className="card p-6 lg:sticky lg:top-28">
                <Pill tone={free ? "clay" : "plum"}>{formatDuration(offer.durationMinutes)}</Pill>
                <h1 className="mt-4 font-display text-2xl text-ink">{offer.name}</h1>
                <p className="mt-1 text-sm text-clay">{offer.tagline}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{offer.shortDescription}</p>

                <p className="mt-6 border-t border-sand-deep/60 pt-5 font-display text-3xl text-plum">
                  {formatPrice(offer.price)}
                </p>

                <ul className="mt-6 space-y-2.5 text-sm text-muted">
                  {offer.terms.map((term) => (
                    <li key={term} className="flex gap-2.5">
                      <span aria-hidden="true" className="text-clay">
                        ·
                      </span>
                      {term}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 border-t border-sand-deep/60 pt-5 text-xs leading-relaxed text-muted">
                  Réservation au minimum {bookingRules.minimumNoticeHours} h à l&apos;avance.
                  Disponibilités du lundi au samedi.{" "}
                  <Link href="/cgv" className="text-plum underline">
                    Conditions générales
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Réserver", path: "/reserver" },
          { name: offer.name, path: `/reserver/${offer.slug}` },
        ])}
      />
    </>
  );
}
