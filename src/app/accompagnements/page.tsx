import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { CheckList, Pill, Section, SectionHeading } from "@/components/ui";
import { formatDuration, formatPrice, method, offers } from "@/content/site.config";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Les accompagnements",
  description:
    "Appel découverte gratuit, séance individuelle d'1 h à 50 €, séance approfondie de 2 h à 100 €. Trouve le format adapté à ta situation.",
  path: "/accompagnements",
});

export default function AccompagnementsPage() {
  return (
    <>
      <Section tone="cream">
        <SectionHeading
          eyebrow="Les accompagnements"
          title="Un format pour chaque étape de ton cheminement"
          subtitle="Que tu aies besoin d'un coup de projecteur sur une situation précise ou de remonter le fil de ce qui se répète, le point de départ reste le même : comprendre où tu en es."
        />
      </Section>

      {/* Prestations à l'unité */}
      {offers.map((offer, index) => (
        <Section key={offer.slug} tone={index % 2 === 0 ? "white" : "sand"}>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Pill tone={offer.price === 0 ? "clay" : "plum"}>
                  {formatDuration(offer.durationMinutes)}
                </Pill>
                <Pill tone="plum">{formatPrice(offer.price)}</Pill>
              </div>

              <h2 className="mt-5 text-3xl text-ink md:text-4xl">{offer.name}</h2>
              <p className="mt-2 font-display text-lg text-clay">{offer.tagline}</p>
              <p className="mt-5 text-base leading-relaxed text-muted">{offer.description}</p>

              <h3 className="mt-9 font-display text-lg text-ink">Pour qui ?</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {offer.problems.map((problem) => (
                  <li
                    key={problem}
                    className="rounded-full border border-sand-deep bg-white px-4 py-2 text-sm text-muted"
                  >
                    {problem}
                  </li>
                ))}
              </ul>

              <h3 className="mt-9 font-display text-lg text-ink">Ce que tu en retires</h3>
              <div className="mt-4">
                <CheckList items={offer.benefits} />
              </div>
            </div>

            <div>
              <div className="card p-6 md:p-8">
                <h3 className="font-display text-lg text-ink">Déroulement</h3>
                <ol className="mt-5 space-y-4">
                  {offer.steps.map((step, stepIndex) => (
                    <li key={step} className="flex gap-3.5">
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-plum-soft text-sm font-semibold text-plum"
                      >
                        {stepIndex + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-muted">{step}</span>
                    </li>
                  ))}
                </ol>

                <h3 className="mt-8 border-t border-sand-deep/60 pt-6 font-display text-lg text-ink">
                  Modalités
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-muted">
                  {offer.terms.map((term) => (
                    <li key={term} className="flex gap-2.5">
                      <span aria-hidden="true" className="text-clay">
                        ·
                      </span>
                      {term}
                    </li>
                  ))}
                </ul>

                <Link href={`/reserver/${offer.slug}`} className="btn btn-primary mt-8 w-full">
                  {offer.price === 0 ? "Réserver" : "Réserver & payer"}
                </Link>
                <Link
                  href={`/accompagnements/${offer.slug}`}
                  className="btn btn-secondary mt-2 w-full"
                >
                  Page détaillée
                </Link>
              </div>
            </div>
          </div>
        </Section>
      ))}

      {/* Méthode */}
      <Section tone="cream">
        <SectionHeading eyebrow="La méthode" title={method.title} subtitle={method.subtitle} />
        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {method.steps.map((step) => (
            <li key={step.number} className="card p-6">
              <span className="font-display text-3xl text-clay">{step.number}</span>
              <p className="mt-4 font-display text-xl text-ink">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <Link href="/reserver/appel-decouverte" className="btn btn-primary">
            Réserver mon appel découverte
          </Link>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Accompagnements", path: "/accompagnements" },
        ])}
      />
    </>
  );
}
