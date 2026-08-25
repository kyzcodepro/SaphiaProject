import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { CheckList, Pill, Section, SectionHeading } from "@/components/ui";
import {
  bookingRules,
  formatDuration,
  formatPrice,
  getOffer,
  offers,
  whatsappLink,
} from "@/content/site.config";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return offers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = getOffer(slug);
  if (!offer) return {};

  return pageMetadata({
    title: `${offer.name} — ${formatDuration(offer.durationMinutes)} · ${formatPrice(offer.price)}`,
    description: offer.shortDescription,
    path: `/accompagnements/${offer.slug}`,
  });
}

export default async function AccompagnementDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const offer = getOffer(slug);
  if (!offer) notFound();

  const { name: title, tagline, description } = offer;

  return (
    <>
      <Section tone="cream">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/accompagnements"
            className="text-sm text-muted underline underline-offset-4 hover:text-plum"
          >
            ← Tous les accompagnements
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Pill tone="clay">{formatDuration(offer.durationMinutes)}</Pill>
            <Pill tone="plum">{formatPrice(offer.price)}</Pill>
          </div>

          <h1 className="mt-5 text-4xl leading-tight text-ink md:text-5xl">{title}</h1>
          <p className="mt-3 font-display text-xl text-clay">{tagline}</p>
          <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">{description}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={`/reserver/${offer.slug}`} className="btn btn-primary">
              {offer.price === 0 ? "Réserver" : "Réserver & payer"}
            </Link>
            <a
              href={whatsappLink(`Bonjour Saphia, j'aimerais des informations sur « ${title} ».`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Poser une question
            </a>
          </div>
        </div>
      </Section>

        <Section tone="white">
          <div className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-2xl text-ink">Les situations concernées</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {offer.problems.map((problem) => (
                  <li
                    key={problem}
                    className="rounded-full border border-sand-deep bg-cream px-4 py-2 text-sm text-muted"
                  >
                    {problem}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl text-ink">Ce que tu en retires</h2>
              <div className="mt-5">
                <CheckList items={offer.benefits} />
              </div>
            </div>
          </div>
        </Section>

        <Section tone="sand">
          <div className="mx-auto max-w-4xl">
            <SectionHeading title="Comment ça se passe" align="left" />
            <ol className="mt-8 grid gap-4 md:grid-cols-2">
              {offer.steps.map((step, index) => (
                <li key={step} className="card flex gap-4 p-6">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-plum-soft font-semibold text-plum"
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-muted">{step}</span>
                </li>
              ))}
            </ol>

            <div className="card mt-8 p-6 md:p-8">
              <h2 className="font-display text-xl text-ink">Modalités</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {offer.terms.map((term) => (
                  <li key={term} className="flex gap-2.5 text-sm text-muted">
                    <span aria-hidden="true" className="text-clay">
                      ·
                    </span>
                    {term}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-sand-deep/60 pt-5 text-sm text-muted">
                Disponibilités du lundi au samedi · réservation {bookingRules.minimumNoticeHours} h
                à l&apos;avance minimum · {bookingRules.bufferMinutes} minutes entre deux séances.
              </p>
            </div>
          </div>
        </Section>

        <JsonLd data={serviceJsonLd(offer)} />

      <Section tone="plum">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl text-cream md:text-4xl">Une question avant de te lancer ?</h2>
          <p className="mt-4 text-base leading-relaxed text-cream/80">
            Écris-moi, je réponds personnellement. Et si tu préfères en parler de vive voix, l&apos;appel
            découverte est là pour ça.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="btn bg-cream text-plum hover:bg-white">
              Me contacter
            </Link>
            <Link
              href="/reserver/appel-decouverte"
              className="btn border border-cream/30 text-cream hover:bg-cream/10"
            >
              Réserver 30 min gratuitement
            </Link>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Accompagnements", path: "/accompagnements" },
          { name: title, path: `/accompagnements/${slug}` },
        ])}
      />
    </>
  );
}
