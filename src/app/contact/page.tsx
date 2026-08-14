import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { Section, SectionHeading } from "@/components/ui";
import { brand, whatsappLink } from "@/content/site.config";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Me contacter",
  description:
    "Une question sur l'accompagnement, les tarifs ou les disponibilités ? Écris-moi par WhatsApp, par email ou via le formulaire — je réponds personnellement.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Section tone="cream">
        <SectionHeading
          eyebrow="Contact"
          title="Me contacter"
          subtitle="Une question avant de réserver ? Écris-moi. Je réponds personnellement, généralement sous 48 heures ouvrées."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          {/* Canaux directs (§24) */}
          <div className="space-y-4">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-4 p-6 transition-transform hover:-translate-y-1"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[#25d366]/15 text-xl"
              >
                💬
              </span>
              <span>
                <span className="block font-display text-lg text-ink">WhatsApp</span>
                <span className="block text-sm text-muted">
                  Le plus rapide — réponse dans la journée en général
                </span>
              </span>
            </a>

            <a
              href={`mailto:${brand.email}`}
              className="card flex items-center gap-4 p-6 transition-transform hover:-translate-y-1"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-plum-soft text-xl"
              >
                ✉️
              </span>
              <span>
                <span className="block font-display text-lg text-ink">Email</span>
                <span className="block text-sm text-muted">{brand.email}</span>
              </span>
            </a>

            <a
              href={brand.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-4 p-6 transition-transform hover:-translate-y-1"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-clay-soft text-xl"
              >
                🎬
              </span>
              <span>
                <span className="block font-display text-lg text-ink">TikTok</span>
                <span className="block text-sm text-muted">Mes contenus au quotidien</span>
              </span>
            </a>

            <a
              href={brand.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-4 p-6 transition-transform hover:-translate-y-1"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-clay-soft text-xl"
              >
                📸
              </span>
              <span>
                <span className="block font-display text-lg text-ink">Instagram</span>
                <span className="block text-sm text-muted">Coulisses et conseils</span>
              </span>
            </a>

            <div className="card bg-plum p-6 text-cream">
              <p className="font-display text-lg">Tu préfères en parler de vive voix ?</p>
              <p className="mt-2 text-sm text-cream/80">
                L&apos;appel découverte de 30 minutes est gratuit et sans engagement.
              </p>
              <Link
                href="/reserver/appel-decouverte"
                className="btn mt-5 w-full bg-cream text-plum hover:bg-white"
              >
                Réserver mon appel découverte
              </Link>
            </div>
          </div>

          <ContactForm />
        </div>
      </Section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
    </>
  );
}
