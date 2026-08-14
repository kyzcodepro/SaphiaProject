import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { bookingRules, brand, ebook } from "@/content/site.config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Annulation & remboursement",
  description:
    "Conditions d'annulation, de report et de remboursement des séances : délais, absence, retard et cas particuliers.",
  path: "/annulation-et-remboursement",
});

export default function AnnulationPage() {
  return (
    <LegalPage
      title="Annulation & remboursement"
      intro="Un imprévu, ça arrive. Voici les règles, pensées pour rester simples et équitables des deux côtés."
      updatedAt="14 août 2026"
    >
      <h2>1. Annuler ou déplacer un rendez-vous</h2>
      <p>
        Chaque email de confirmation contient deux liens permettant d&apos;
        <strong>annuler</strong> ou de <strong>reprogrammer</strong> le rendez-vous en autonomie,
        sans avoir à écrire.
      </p>

      <h2>2. Délais applicables</h2>
      <ul>
        <li>
          <strong>Plus de {bookingRules.cancellationNoticeHours} heures avant la séance</strong> —
          annulation ou report sans frais. En cas d&apos;annulation d&apos;une séance payante, le
          remboursement est intégral.
        </li>
        <li>
          <strong>Moins de {bookingRules.cancellationNoticeHours} heures avant la séance</strong> —
          le créneau ne pouvant plus être réattribué, la séance est due. Un report exceptionnel reste
          possible une fois, à l&apos;appréciation de la Prestataire.
        </li>
        <li>
          <strong>Absence sans prévenir</strong> — la séance est considérée comme réalisée et
          n&apos;est pas remboursée.
        </li>
      </ul>

      <h2>3. Retard</h2>
      <p>
        En cas de retard du Client, la séance débute à son arrivée et se termine à l&apos;heure
        initialement prévue, afin de ne pas décaler les rendez-vous suivants. Au-delà de{" "}
        {"{{ durée — recommandé : 20 }}"} minutes de retard sans nouvelle, la séance est considérée
        comme une absence.
      </p>
      <p>
        En cas de retard ou d&apos;empêchement de la Prestataire, la séance est intégralement
        reportée à la convenance du Client, ou remboursée.
      </p>

      <h2>4. Remboursements</h2>
      <p>
        Les remboursements sont effectués sur le moyen de paiement d&apos;origine (carte bancaire via
        Stripe, ou PayPal), sous <strong>14 jours maximum</strong>. Le délai de réapparition sur le
        compte dépend ensuite de l&apos;établissement bancaire, généralement 2 à 5 jours ouvrés.
      </p>

      <h2>5. Appel découverte</h2>
      <p>
        L&apos;appel découverte étant gratuit, aucun frais n&apos;est dû en cas d&apos;annulation.
        Merci toutefois de prévenir dès que possible afin de libérer le créneau pour une autre
        personne.
      </p>

      <h2>6. Accompagnements 6 et 12 mois</h2>
      <p>
        Les séances incluses dans un programme suivent les mêmes règles de délai. Une séance annulée
        moins de {bookingRules.cancellationNoticeHours} heures à l&apos;avance est décomptée du
        forfait.
      </p>
      <p>
        En cas d&apos;interruption anticipée du programme à l&apos;initiative du Client, les séances
        non consommées sont {"{{ à définir : remboursées au prorata / non remboursées / valables 12 mois }}"}.
        Les modalités précises figurent dans la proposition individuelle acceptée avant le démarrage.
      </p>

      <h2>7. Ebook</h2>
      <p>
        L&apos;ebook «&nbsp;{ebook.title}&nbsp;» est un contenu numérique livré immédiatement après
        le paiement. En validant l&apos;achat, tu demandes sa fourniture immédiate et renonces à ton
        droit de rétractation&nbsp;: il n&apos;est donc <strong>ni repris ni remboursé</strong> une
        fois le lien de téléchargement délivré.
      </p>
      <p>
        Cette règle a une exception&nbsp;: si le fichier est illisible, corrompu ou si le lien ne
        fonctionne pas, écris-moi — je te renvoie le fichier, et si le problème persiste, je te
        rembourse intégralement.
      </p>

      <h2>8. Cas de force majeure</h2>
      <p>
        En cas d&apos;événement grave et imprévisible (maladie, accident, deuil, hospitalisation),
        les délais ci-dessus ne s&apos;appliquent pas&nbsp;: la séance est reportée sans frais.
        L&apos;humain passe avant la règle — écris-moi simplement à{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a>.
      </p>

      <h2>9. Droit de rétractation</h2>
      <p>
        Le droit de rétractation légal de 14 jours est détaillé à l&apos;article 6 des{" "}
        <Link href="/cgv">conditions générales de vente</Link>.
      </p>
    </LegalPage>
  );
}
