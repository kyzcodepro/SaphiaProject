import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { OfferCard, ProgramCard } from "@/components/OfferCard";
import { CheckList, Pill, Section, SectionHeading } from "@/components/ui";
import {
  about,
  brand,
  bookingRules,
  ebook,
  faq,
  hero,
  method,
  offers,
  problems,
  programs,
  testimonials,
  whatsappLink,
} from "@/content/site.config";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  // La page d'accueil ne bénéficie pas du gabarit de titre défini dans le
  // layout racine (même segment) : le nom de la marque y est donc explicite.
  title: `${brand.name} — accompagnement mindset & développement personnel`,
  description:
    "Retrouve clarté, confiance et motivation avec un accompagnement personnalisé. Appel découverte gratuit de 30 minutes, séances individuelles dès 50 €, en visio ou par WhatsApp.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      {/* ─────────────────────────────── Hero ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-cream">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-clay-soft blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-plum-soft blur-3xl"
        />

        <div className="container-page relative grid gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="animate-rise">
            <Pill tone="clay">Appel découverte offert · 30 minutes</Pill>
            <h1 className="mt-6 text-4xl leading-[1.1] text-ink md:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {hero.subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href={hero.primaryCta.href} className="btn btn-primary">
                {hero.primaryCta.label}
              </Link>
              <Link href={hero.secondaryCta.href} className="btn btn-secondary">
                {hero.secondaryCta.label}
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-sand-deep pt-8">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Disponibilités</dt>
                <dd className="mt-1 font-display text-lg text-ink">Lundi → samedi</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Format</dt>
                <dd className="mt-1 font-display text-lg text-ink">Zoom ou WhatsApp</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Premier échange</dt>
                <dd className="mt-1 font-display text-lg text-ink">Gratuit</dd>
              </div>
            </dl>
          </div>

          {/* Photo professionnelle — à remplacer dans /public/images/ (§45) */}
          <div className="relative">
            <div className="relative mx-auto aspect-4/5 w-full max-w-md overflow-hidden rounded-[2.5rem] bg-sand shadow-[var(--shadow-lift)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.image}
                alt={hero.imageAlt}
                className="h-full w-full object-cover"
                width={640}
                height={800}
                fetchPriority="high"
              />
            </div>
            <div className="card absolute -bottom-6 left-1/2 w-[min(20rem,90%)] -translate-x-1/2 p-5 md:left-auto md:right-4 md:translate-x-0">
              <p className="text-sm leading-relaxed text-muted">
                «&nbsp;On part de là où tu en es, et on avance à ton rythme.&nbsp;»
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────── Présentation ────────────────────────── */}
      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <span className="eyebrow">Qui je suis</span>
            <h2 className="mt-3 text-3xl leading-tight text-ink md:text-4xl">{about.title}</h2>
            <div className="mt-6 space-y-4">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:content-start">
            {about.values.map((value) => (
              <div key={value.title} className="card p-6">
                <p className="font-display text-lg text-plum">{value.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ───────────────────────────── Problématiques ─────────────────────── */}
      <Section tone="sand">
        <SectionHeading eyebrow="Pour qui" title={problems.title} subtitle={problems.subtitle} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.items.map((item) => (
            <div key={item.title} className="card p-6">
              <p className="font-display text-lg text-ink">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/reserver/appel-decouverte" className="btn btn-primary">
            En parler pendant 30 minutes, gratuitement
          </Link>
        </div>
      </Section>

      {/* ────────────────────────── Les accompagnements ───────────────────── */}
      <Section id="accompagnements" tone="cream">
        <SectionHeading
          eyebrow="Les accompagnements"
          title="Trouve le format qui correspond à ton besoin"
          subtitle="Une séance ponctuelle pour débloquer une situation, ou un accompagnement dans la durée pour transformer en profondeur."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.slug} offer={offer} highlight={offer.slug === "appel-decouverte"} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {programs.map((program) => (
            <ProgramCard key={program.slug} program={program} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Réservation au minimum {bookingRules.minimumNoticeHours} h à l&apos;avance · Paiement
          sécurisé par carte bancaire ou PayPal · Annulation possible jusqu&apos;à{" "}
          {bookingRules.cancellationNoticeHours} h avant la séance.
        </p>
      </Section>

      {/* ─────────────────────────────── Méthode ──────────────────────────── */}
      <Section tone="plum">
        <SectionHeading
          eyebrow="La méthode"
          title={method.title}
          subtitle={method.subtitle}
          tone="light"
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-4">
          {method.steps.map((step) => (
            <li key={step.number} className="rounded-[1.75rem] border border-cream/15 bg-cream/5 p-6">
              <span className="font-display text-3xl text-clay">{step.number}</span>
              <p className="mt-4 font-display text-xl text-cream">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ────────────────────────────── Témoignages ───────────────────────── */}
      <Section tone="white">
        <SectionHeading
          eyebrow="Elles et ils en parlent"
          title="Ce que disent les personnes accompagnées"
        />
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

      {/* ──────────────────────────────── Ebook ───────────────────────────── */}
      <Section tone="sand">
        <div className="card grid gap-8 overflow-hidden p-7 md:grid-cols-[0.8fr_1.2fr] md:items-center md:p-12">
          <div className="mx-auto aspect-3/4 w-full max-w-56 overflow-hidden rounded-2xl bg-plum-soft shadow-[var(--shadow-lift)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ebook.cover}
              alt={`Couverture de l'ebook ${ebook.title}`}
              className="h-full w-full object-cover"
              width={400}
              height={533}
              loading="lazy"
            />
          </div>
          <div>
            <span className="eyebrow">L&apos;ebook</span>
            <h2 className="mt-3 text-3xl text-ink md:text-4xl">{ebook.title}</h2>
            <p className="mt-2 font-display text-lg text-clay">{ebook.subtitle}</p>
            <p className="mt-4 text-base leading-relaxed text-muted">{ebook.description}</p>
            <div className="mt-8">
              <Link href="/ebook" className="btn btn-primary">
                Découvrir l&apos;ebook
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────── FAQ ─────────────────────────────── */}
      <Section tone="cream">
        <SectionHeading eyebrow="Questions fréquentes" title="Tout ce que tu veux savoir avant de réserver" />
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faq.map((item) => (
            <details key={item.question} className="card group p-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg text-ink">
                {item.question}
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-plum-soft text-plum transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ─────────────────────────────── CTA final ────────────────────────── */}
      <Section tone="plum">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl leading-tight text-cream md:text-4xl">
            Tu ne sais pas quel accompagnement choisir ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cream/80">
            Réserve 30 minutes gratuitement. On fait le point sur ta situation et je te dis
            honnêtement si — et comment — je peux t&apos;aider.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/reserver/appel-decouverte" className="btn bg-cream text-plum hover:bg-white">
              Réserver 30 minutes gratuitement
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border border-cream/30 text-cream hover:bg-cream/10"
            >
              Me contacter sur WhatsApp
            </a>
          </div>

          <div className="mx-auto mt-12 max-w-md">
            <CheckList
              tone="light"
              items={[
                "Aucun paiement, aucun engagement",
                "Créneaux du lundi au samedi",
                "En visio ou par téléphone via WhatsApp",
              ]}
            />
          </div>
        </div>
      </Section>

      <JsonLd data={faqJsonLd()} />
    </>
  );
}
