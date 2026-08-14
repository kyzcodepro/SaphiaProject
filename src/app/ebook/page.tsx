import type { Metadata } from "next";
import Link from "next/link";
import { EbookForm } from "@/components/EbookForm";
import { JsonLd } from "@/components/JsonLd";
import { CheckList, Pill, Section, SectionHeading } from "@/components/ui";
import { ebook, formatPrice, testimonials } from "@/content/site.config";
import { breadcrumbJsonLd, ebookJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Ebook — ${ebook.title}`,
  description: ebook.description,
  path: "/ebook",
});

export default function EbookPage() {
  return (
    <>
      {/* Hero — point d'arrivée du trafic TikTok (§20) */}
      <section className="bg-cream">
        <div className="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div className="mx-auto aspect-3/4 w-full max-w-72 overflow-hidden rounded-[2rem] bg-plum-soft shadow-[var(--shadow-lift)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ebook.cover}
              alt={`Couverture de l'ebook ${ebook.title}`}
              className="h-full w-full object-cover"
              width={560}
              height={747}
              fetchPriority="high"
            />
          </div>

          <div>
            <Pill tone="clay">{ebook.price === 0 ? "Gratuit" : formatPrice(ebook.price)}</Pill>
            <h1 className="mt-5 text-4xl leading-tight text-ink md:text-5xl">{ebook.title}</h1>
            <p className="mt-3 font-display text-xl text-clay">{ebook.subtitle}</p>
            <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
              {ebook.description}
            </p>

            <div className="mt-8">
              <CheckList items={ebook.benefits} />
            </div>

            <div className="mt-9">
              <a href="#recevoir" className="btn btn-primary">
                {ebook.price === 0 ? "Recevoir l'ebook gratuitement" : "Obtenir l'ebook"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <Section tone="white">
        <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Au sommaire" title="Ce que tu vas y trouver" align="left" />
            <ol className="mt-7 space-y-3">
              {ebook.chapters.map((chapter, index) => (
                <li key={chapter} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-plum-soft text-sm font-semibold text-plum"
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-muted">{chapter}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <SectionHeading eyebrow="Pour qui" title="Cet ebook est fait pour toi si…" align="left" />
            <div className="mt-7">
              <CheckList items={ebook.audience} />
            </div>

            <div className="card mt-8 p-6">
              <p className="text-sm leading-relaxed text-muted">
                Cet ebook reprend les fondamentaux que j&apos;utilise en accompagnement. Il ne
                remplace pas un suivi personnalisé, mais il te permet de commencer seule, à ton
                rythme.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Formulaire de récupération */}
      <Section id="recevoir" tone="sand">
        <div className="mx-auto max-w-xl">
          <SectionHeading
            eyebrow="Télécharger"
            title={ebook.price === 0 ? "Reçois ton exemplaire" : "Obtiens ton exemplaire"}
          />
          <div className="mt-10">
            <EbookForm />
          </div>
        </div>
      </Section>

      {/* Témoignages */}
      <Section tone="white">
        <SectionHeading eyebrow="Retours" title="Ce qu'en disent les lecteurs" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.author} className="card flex h-full flex-col p-7">
              <span aria-hidden="true" className="font-display text-4xl leading-none text-clay">
                “
              </span>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-5 border-t border-sand-deep/60 pt-4">
                <span className="block font-display text-base text-ink">{testimonial.author}</span>
                <span className="text-xs text-muted">{testimonial.context}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Tunnel ebook → accompagnement (§21) */}
      <Section tone="plum">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl leading-tight text-cream md:text-4xl">Tu veux aller plus loin ?</h2>
          <p className="mt-4 text-base leading-relaxed text-cream/80">
            L&apos;ebook te donne les bases. Si tu sens que tu as besoin d&apos;un regard extérieur
            sur ta situation, on peut en parler 30 minutes, gratuitement et sans engagement.
          </p>
          <div className="mt-9">
            <Link
              href="/reserver/appel-decouverte"
              className="btn bg-cream text-plum hover:bg-white"
            >
              Réserver mon appel découverte
            </Link>
          </div>
        </div>
      </Section>

      <JsonLd data={ebookJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Ebook", path: "/ebook" },
        ])}
      />
    </>
  );
}
