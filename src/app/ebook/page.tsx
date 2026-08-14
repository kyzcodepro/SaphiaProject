import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EbookPurchase } from "@/components/EbookPurchase";
import { JsonLd } from "@/components/JsonLd";
import { CheckList, Pill, Section, SectionHeading } from "@/components/ui";
import { ebook, formatPrice } from "@/content/site.config";
import { breadcrumbJsonLd, ebookJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `Ebook — ${ebook.title}`,
  description: `${ebook.subtitle}. ${ebook.description}`,
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
            <div className="flex flex-wrap items-center gap-3">
              <Pill tone="clay">{ebook.price === 0 ? "Gratuit" : formatPrice(ebook.price)}</Pill>
              <Pill tone="plum">{ebook.pageCount} pages · PDF</Pill>
            </div>

            <h1 className="mt-5 text-4xl leading-tight text-ink md:text-5xl">{ebook.title}</h1>
            <p className="mt-3 font-display text-xl text-clay">{ebook.subtitle}</p>
            <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
              {ebook.description}
            </p>

            <div className="mt-8">
              <CheckList items={ebook.benefits} />
            </div>

            <div className="mt-9">
              <a href="#obtenir" className="btn btn-primary">
                {ebook.price === 0
                  ? "Recevoir l'ebook gratuitement"
                  : `Obtenir l'ebook — ${formatPrice(ebook.price)}`}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* À qui il s'adresse */}
      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Avant de commencer"
            title="Ce guide est fait pour toi si…"
            align="left"
          />
          <div className="mt-7">
            <CheckList items={ebook.audience} />
          </div>

          <blockquote className="mt-10 border-l-2 border-clay pl-6">
            <p className="font-display text-xl leading-relaxed text-ink md:text-2xl">
              «&nbsp;{ebook.quote}&nbsp;»
            </p>
          </blockquote>
        </div>
      </Section>

      {/* Sommaire réel du guide */}
      <Section tone="sand">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Au sommaire"
            title={`${ebook.chapters.length} chapitres, et ce qu'il faut pour les mettre en pratique`}
          />

          <ol className="mt-12 grid gap-3 md:grid-cols-2">
            {ebook.chapters.map((chapter, index) => (
              <li key={chapter} className="card flex gap-4 p-5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-plum-soft font-display text-sm font-semibold text-plum"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed text-ink">{chapter}</span>
              </li>
            ))}
          </ol>

          <div className="card mt-6 p-6 md:p-8">
            <span className="eyebrow">Inclus également</span>
            <div className="mt-5">
              <CheckList items={[...ebook.bonuses]} />
            </div>
          </div>
        </div>
      </Section>

      {/* Achat */}
      <Section id="obtenir" tone="cream">
        <div className="mx-auto max-w-xl">
          <SectionHeading
            eyebrow={ebook.price === 0 ? "Télécharger" : "Commander"}
            title="Reçois ton exemplaire"
            subtitle="Format PDF, à lire sur téléphone, tablette ou ordinateur."
          />
          <div className="mt-10">
            <Suspense
              fallback={
                <p role="status" className="text-center text-sm text-muted">
                  Chargement…
                </p>
              }
            >
              <EbookPurchase />
            </Suspense>
          </div>
        </div>
      </Section>

      {/* Tunnel ebook → accompagnement (§21) */}
      <Section tone="plum">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl leading-tight text-cream md:text-4xl">Tu veux aller plus loin ?</h2>
          <p className="mt-4 text-base leading-relaxed text-cream/80">
            Ce que tu liras dans ce guide peut déjà changer beaucoup de choses. Ce que tu vivras en
            accompagnement ira plus vite, et plus loin — parce que ce sera le tien, pas un cas
            général.
          </p>
          <div className="mt-9">
            <Link href="/reserver/appel-decouverte" className="btn bg-cream text-plum hover:bg-white">
              Réserver mon appel découverte
            </Link>
          </div>
          <p className="mt-5 text-sm text-cream/70">
            30 minutes, gratuit, sans engagement. Par téléphone ou en visio.
          </p>
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
