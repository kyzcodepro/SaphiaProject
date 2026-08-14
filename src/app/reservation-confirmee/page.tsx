import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui";
import {
  brand,
  bookingRules,
  ebook,
  formatDuration,
  getOffer,
  whatsappLink,
} from "@/content/site.config";
import { pageMetadata } from "@/lib/seo";

/**
 * Page de confirmation personnalisée (§22).
 *
 * Le client n'atterrit jamais sur une page Calendly vide : il retrouve ici le
 * rappel de sa réservation, la marche à suivre, l'ebook et les réseaux.
 */

export const metadata: Metadata = pageMetadata({
  title: "Réservation confirmée",
  description: "Ton rendez-vous est confirmé. Voici la suite.",
  path: "/reservation-confirmee",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ offre?: string }> };

export default async function ReservationConfirmeePage({ searchParams }: PageProps) {
  const { offre } = await searchParams;
  const offer = offre ? getOffer(offre) : undefined;

  return (
    <>
      <Section tone="cream">
        <div className="mx-auto max-w-2xl text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-plum text-3xl text-cream"
          >
            ✓
          </span>

          <h1 className="mt-8 text-4xl leading-tight text-ink md:text-5xl">
            Ton rendez-vous est confirmé.
          </h1>

          <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
            {offer ? (
              <>
                Ta réservation pour <strong className="text-ink">{offer.name}</strong> (
                {formatDuration(offer.durationMinutes)}) est enregistrée. Tu viens de recevoir un
                email récapitulatif avec la date, l&apos;heure et le lien de connexion.
              </>
            ) : (
              <>
                Ta réservation est enregistrée. Tu viens de recevoir un email récapitulatif avec la
                date, l&apos;heure et le lien de connexion.
              </>
            )}
          </p>
        </div>

        <div className="card mx-auto mt-12 max-w-2xl p-7 md:p-9">
          <h2 className="font-display text-xl text-ink">La suite</h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                title: "Vérifie ta boîte mail",
                text: "L'email de confirmation contient la date, l'heure, la durée et le lien Zoom ou les instructions WhatsApp. Pense à regarder tes spams la première fois.",
              },
              {
                title: "Tu recevras des rappels",
                text: `Un rappel automatique t'est envoyé ${bookingRules.minimumNoticeHours} h avant la séance, puis un second quelques heures avant.`,
              },
              {
                title: "Prépare ton échange",
                text: "Installe-toi dans un endroit calme où tu peux parler librement. Note ce qui te semble important d'aborder — même en désordre.",
              },
              {
                title: "Besoin de déplacer ?",
                text: `Tu peux annuler ou reporter jusqu'à ${bookingRules.cancellationNoticeHours} h avant le rendez-vous, depuis les liens présents dans ton email de confirmation.`,
              },
            ].map((item, index) => (
              <li key={item.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-plum-soft text-sm font-semibold text-plum"
                >
                  {index + 1}
                </span>
                <span>
                  <span className="block font-semibold text-ink">{item.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{item.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Mise en avant de l'ebook (§22) */}
      <Section tone="sand">
        <div className="card mx-auto grid max-w-3xl gap-7 p-7 md:grid-cols-[0.7fr_1.3fr] md:items-center md:p-10">
          <div className="mx-auto aspect-3/4 w-full max-w-44 overflow-hidden rounded-2xl bg-plum-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ebook.cover}
              alt={`Couverture de l'ebook ${ebook.title}`}
              className="h-full w-full object-cover"
              width={320}
              height={427}
              loading="lazy"
            />
          </div>
          <div>
            <span className="eyebrow">En attendant notre échange</span>
            <h2 className="mt-3 font-display text-2xl text-ink">{ebook.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{ebook.description}</p>
            <Link href="/ebook" className="btn btn-primary mt-6">
              Découvrir mon ebook
            </Link>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl text-ink">On reste en contact</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Une question d&apos;ici notre rendez-vous ? Écris-moi, je réponds personnellement.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              Me contacter sur WhatsApp
            </a>
            <a
              href={brand.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Me suivre sur TikTok
            </a>
            <a
              href={brand.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Instagram
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
