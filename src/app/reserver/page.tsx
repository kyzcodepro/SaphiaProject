import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { OfferCard } from "@/components/OfferCard";
import { Section, SectionHeading } from "@/components/ui";
import { bookingRules, offers } from "@/content/site.config";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Réserver une séance",
  description:
    "Réserve ton appel découverte gratuit de 30 minutes, une séance individuelle d'1 h (50 €) ou une séance approfondie de 2 h (100 €). Disponibilités du lundi au samedi, en visio ou par WhatsApp.",
  path: "/reserver",
});

export default function ReserverPage() {
  return (
    <>
      <Section tone="cream">
        <SectionHeading
          eyebrow="Réserver"
          title="Choisis le format qui te convient"
          subtitle="Sélectionne une prestation, remplis un court questionnaire, choisis ton créneau. Tu reçois immédiatement une confirmation par email."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.slug} offer={offer} highlight={offer.price === 0} />
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="card p-6 md:p-8">
            <h2 className="font-display text-xl text-ink">Bon à savoir avant de réserver</h2>
            <ul className="mt-5 grid gap-4 text-sm leading-relaxed text-muted sm:grid-cols-2">
              <li>
                <strong className="block text-ink">Délai de réservation</strong>
                Les rendez-vous se réservent au minimum {bookingRules.minimumNoticeHours} h à
                l&apos;avance.
              </li>
              <li>
                <strong className="block text-ink">Entre deux séances</strong>
                Un intervalle de {bookingRules.bufferMinutes} minutes est automatiquement respecté.
              </li>
              <li>
                <strong className="block text-ink">Paiement</strong>
                Les séances payantes se règlent en ligne par carte bancaire ou PayPal, avant la
                confirmation du créneau.
              </li>
              <li>
                <strong className="block text-ink">Annulation</strong>
                Annulation ou report possible jusqu&apos;à {bookingRules.cancellationNoticeHours} h
                avant la séance, depuis ton email de confirmation.
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-3xl">
          <div className="card p-6 md:p-8">
            <h2 className="font-display text-xl text-ink">Mes disponibilités</h2>
            <dl className="mt-5 divide-y divide-sand-deep/50">
              {bookingRules.openingHours.map((slot) => (
                <div key={slot.day} className="flex items-center justify-between py-2.5 text-sm">
                  <dt className="text-ink">{slot.day}</dt>
                  <dd className="text-muted">{slot.hours}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm text-muted">
              Seuls les créneaux réellement libres apparaissent dans le calendrier au moment de la
              réservation.
            </p>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Réserver", path: "/reserver" },
        ])}
      />
    </>
  );
}
