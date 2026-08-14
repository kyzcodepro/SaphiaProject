import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { bookingRules, brand, formatPrice, offers } from "@/content/site.config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente des séances d'accompagnement : prestations, tarifs, paiement, déroulement, annulation et droit de rétractation.",
  path: "/cgv",
});

export default function CgvPage() {
  return (
    <LegalPage
      title="Conditions générales de vente"
      intro="Ces conditions encadrent la réservation et le déroulement des séances d'accompagnement proposées sur ce site."
      updatedAt="14 août 2026"
    >
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales de vente (CGV) régissent les relations entre{" "}
        <strong>{"{{ Prénom NOM }}"}</strong>, exerçant sous le nom commercial{" "}
        <strong>{brand.legalName}</strong> (ci-après « la Prestataire »), et toute personne physique
        majeure réservant une prestation sur le site {brand.url} (ci-après « le Client »).
      </p>
      <p>
        Toute réservation implique l&apos;acceptation pleine et entière des présentes CGV, dont le
        Client reconnaît avoir pris connaissance avant de valider son paiement.
      </p>

      <h2>2. Prestations proposées</h2>
      <ul>
        {offers.map((offer) => (
          <li key={offer.slug}>
            <strong>{offer.name}</strong> — {offer.durationMinutes} minutes —{" "}
            {formatPrice(offer.price)}
          </li>
        ))}
        <li>
          <strong>Accompagnements 6 et 12 mois</strong> — contenu, durée, nombre de séances et tarif
          définis dans une proposition individuelle remise après l&apos;appel découverte, acceptée
          par écrit avant le démarrage.
        </li>
      </ul>
      <p>
        Les prestations relèvent de l&apos;accompagnement en développement personnel. Elles ne
        constituent ni un acte médical, ni une psychothérapie, ni un conseil juridique, financier ou
        fiscal. La Prestataire est tenue à une <strong>obligation de moyens</strong> et non de
        résultat&nbsp;: le Client reste seul décisionnaire des actions qu&apos;il engage.
      </p>

      <h2>3. Tarifs et paiement</h2>
      <p>
        Les prix sont indiqués en euros. {"{{ Mention TVA : « TVA non applicable, article 293 B du CGI » ou taux applicable }}"}.
      </p>
      <p>
        Pour les prestations payantes, <strong>le règlement intégral s&apos;effectue en ligne au
        moment de la réservation</strong>, par carte bancaire via Stripe ou via PayPal. La
        réservation n&apos;est définitive qu&apos;après validation effective du paiement&nbsp;: en cas
        d&apos;échec, aucun créneau n&apos;est bloqué et aucune somme n&apos;est due.
      </p>
      <p>
        L&apos;appel découverte de 30 minutes est gratuit et ne donne lieu à aucun paiement ni à
        aucune obligation d&apos;achat.
      </p>
      <p>
        Pour les accompagnements longue durée, le paiement peut s&apos;effectuer comptant ou de
        manière échelonnée selon les modalités précisées dans la proposition individuelle. En cas de
        paiement échelonné, le défaut de règlement d&apos;une échéance peut entraîner la suspension
        de l&apos;accompagnement après relance restée sans réponse pendant {"{{ délai }}"} jours.
      </p>

      <h2>4. Réservation et déroulement</h2>
      <p>
        Les rendez-vous sont proposés du lundi au samedi, aux horaires affichés sur le site, et
        doivent être réservés au minimum{" "}
        <strong>{bookingRules.minimumNoticeHours} heures à l&apos;avance</strong>. Un intervalle de{" "}
        {bookingRules.bufferMinutes} minutes est automatiquement respecté entre deux séances.
      </p>
      <p>
        Les séances se déroulent à distance, par visioconférence (Zoom) ou par appel WhatsApp, selon
        le choix effectué par le Client lors de la réservation. Le lien de connexion ou les
        instructions sont transmis par email avec la confirmation.
      </p>
      <p>
        Le Client s&apos;engage à se connecter à l&apos;heure convenue, dans un environnement calme
        et avec une connexion suffisante. En cas de retard du Client, la séance se termine à
        l&apos;heure initialement prévue. En cas de retard ou d&apos;empêchement de la Prestataire,
        la séance est reportée sans frais ou intégralement remboursée.
      </p>

      <h2>5. Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L.221-18 du Code de la consommation, le Client dispose
        d&apos;un délai de <strong>14 jours</strong> à compter de la réservation pour exercer son
        droit de rétractation, sans avoir à motiver sa décision.
      </p>
      <p>
        Toutefois, en application de l&apos;article L.221-25 du même code, si la séance est fixée à
        une date située <strong>à l&apos;intérieur de ce délai de 14 jours</strong>, le Client
        demande expressément l&apos;exécution de la prestation avant la fin du délai de
        rétractation. Dans ce cas, une fois la séance intégralement réalisée, le droit de
        rétractation ne peut plus être exercé pour cette séance. Si la séance n&apos;a pas encore eu
        lieu, la rétractation reste possible et donne lieu à remboursement intégral.
      </p>
      <p>
        Pour exercer ce droit, il suffit d&apos;écrire à{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a>. Le remboursement intervient dans un
        délai maximum de 14 jours, par le même moyen de paiement.
      </p>

      <h2>6. Annulation, report et absence</h2>
      <p>
        Les conditions détaillées figurent sur la page{" "}
        <Link href="/annulation-et-remboursement">Annulation &amp; remboursement</Link>. En résumé&nbsp;:
      </p>
      <ul>
        <li>
          Annulation ou report <strong>plus de {bookingRules.cancellationNoticeHours} heures</strong>{" "}
          avant la séance : sans frais.
        </li>
        <li>
          Annulation <strong>moins de {bookingRules.cancellationNoticeHours} heures</strong> avant la
          séance : la séance est due.
        </li>
        <li>Absence sans prévenir : la séance est due.</li>
      </ul>

      <h2>7. Confidentialité</h2>
      <p>
        Tout ce qui est échangé pendant les séances est strictement confidentiel. Les séances ne font
        l&apos;objet d&apos;aucun enregistrement, sauf accord écrit préalable et explicite du Client.
      </p>

      <h2>8. Propriété intellectuelle</h2>
      <p>
        Les supports, exercices, documents et l&apos;ebook remis au Client sont réservés à son usage
        strictement personnel. Toute diffusion, revente ou reproduction est interdite.
      </p>

      <h2>9. Responsabilité</h2>
      <p>
        La responsabilité de la Prestataire ne saurait être engagée en cas de dommage résultant des
        décisions prises par le Client à la suite d&apos;un accompagnement, ni en cas
        d&apos;interruption due à un problème technique indépendant de sa volonté (panne de réseau,
        indisponibilité de Zoom ou de WhatsApp). Dans ce dernier cas, la séance est reportée sans
        frais.
      </p>

      <h2>10. Données personnelles</h2>
      <p>
        Le traitement des données est détaillé dans la{" "}
        <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>11. Litiges et médiation</h2>
      <p>
        En cas de difficulté, le Client est invité à contacter la Prestataire afin de rechercher une
        solution amiable. À défaut d&apos;accord, il peut recourir gratuitement au médiateur de la
        consommation mentionné dans les <Link href="/mentions-legales">mentions légales</Link>. Les
        présentes CGV sont soumises au droit français.
      </p>
    </LegalPage>
  );
}
