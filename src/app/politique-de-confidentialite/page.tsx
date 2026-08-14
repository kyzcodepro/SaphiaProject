import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { brand } from "@/content/site.config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialité",
  description:
    "Quelles données sont collectées sur le site, pourquoi, combien de temps elles sont conservées et comment exercer tes droits (RGPD).",
  path: "/politique-de-confidentialite",
});

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro="Cette page explique simplement quelles informations sont collectées, pourquoi, avec qui elles sont partagées, et comment tu peux garder la main dessus."
      updatedAt="14 août 2026"
    >
      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données est <strong>{"{{ Prénom NOM }}"}</strong>, éditrice
        du site {brand.url}. Pour toute question relative à tes données, tu peux écrire à{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a>.
      </p>

      <h2>2. Données collectées et finalités</h2>

      <h3>Questionnaire préalable à une réservation</h3>
      <p>
        Lors d&apos;une réservation, les informations suivantes sont demandées&nbsp;: prénom, nom,
        adresse email, mode de rendez-vous souhaité (Zoom ou WhatsApp), et — de manière strictement
        facultative — numéro de téléphone, situation familiale, nombre d&apos;enfants, situation
        professionnelle, objectifs, blocage principal, attentes et informations complémentaires.
      </p>
      <p>
        <strong>Ces informations facultatives ne conditionnent jamais la réservation.</strong> Elles
        servent uniquement à préparer la séance et à la rendre plus utile. Chaque question comporte
        une option « je préfère ne pas répondre », et les champs libres peuvent rester vides.
      </p>
      <ul>
        <li>
          <strong>Finalité</strong> : organiser et préparer le rendez-vous.
        </li>
        <li>
          <strong>Base légale</strong> : exécution de mesures précontractuelles et contractuelles
          (article 6.1.b du RGPD), et consentement pour les informations facultatives relatives à ta
          situation personnelle (article 6.1.a).
        </li>
      </ul>

      <h3>Réservation et calendrier</h3>
      <p>
        La prise de rendez-vous est opérée par <strong>Calendly</strong>, qui traite la date,
        l&apos;horaire, l&apos;adresse email et les réponses au formulaire de réservation, et envoie
        les confirmations et rappels.
      </p>

      <h3>Paiement</h3>
      <p>
        Les paiements sont traités par <strong>Stripe</strong> et <strong>PayPal</strong>.{" "}
        <strong>Aucune donnée bancaire ne transite ni n&apos;est stockée par ce site</strong> : les
        coordonnées de carte sont saisies directement sur les interfaces sécurisées de ces
        prestataires.
      </p>

      <h3>Formulaire de contact et ebook</h3>
      <p>
        Nom, prénom et adresse email, afin de répondre à ta demande ou de t&apos;envoyer l&apos;ebook.
        Base légale : consentement.
      </p>

      <h3>Mesure d&apos;audience</h3>
      <p>
        Des statistiques de fréquentation anonymes sont collectées pour comprendre quelles pages sont
        consultées. Si un outil déposant des cookies est utilisé, il n&apos;est activé
        qu&apos;après ton accord explicite —{" "}
        <Link href="/politique-de-cookies">voir la politique de cookies</Link>.
      </p>

      <h2>3. Données sensibles</h2>
      <p>
        Aucune donnée de santé n&apos;est demandée. Merci de ne pas communiquer, via les formulaires
        du site, d&apos;informations relatives à ta santé, à tes convictions religieuses ou
        politiques, ou à ton orientation sexuelle. Si de telles informations sont abordées pendant
        une séance, elles restent confidentielles et ne font l&apos;objet d&apos;aucun enregistrement
        ni d&apos;aucune conservation numérique au-delà de notes strictement nécessaires au suivi.
      </p>

      <h2>4. Destinataires</h2>
      <p>Tes données ne sont jamais vendues ni cédées à des tiers à des fins commerciales. Elles sont partagées uniquement avec les prestataires nécessaires au fonctionnement du service&nbsp;:</p>
      <ul>
        <li><strong>Calendly</strong> — prise de rendez-vous, confirmations et rappels</li>
        <li><strong>Stripe</strong> et <strong>PayPal</strong> — encaissement des paiements</li>
        <li><strong>{"{{ prestataire d'envoi d'emails — ex. Resend }}"}</strong> — emails transactionnels</li>
        <li><strong>{"{{ hébergeur — ex. Vercel }}"}</strong> — hébergement du site</li>
        <li><strong>Zoom</strong> ou <strong>WhatsApp</strong> — tenue du rendez-vous, selon ton choix</li>
      </ul>
      <p>
        Certains de ces prestataires étant établis hors de l&apos;Union européenne, les transferts
        sont encadrés par les clauses contractuelles types de la Commission européenne ou un
        mécanisme équivalent.
      </p>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li>Questionnaire préalable et notes de séance : {"{{ durée — recommandé : 3 ans après le dernier contact }}"}</li>
        <li>Données de facturation : 10 ans (obligation comptable légale)</li>
        <li>Messages de contact : 3 ans après le dernier échange</li>
        <li>Inscriptions à l&apos;ebook : jusqu&apos;à ta désinscription</li>
        <li>Statistiques de fréquentation : 13 mois maximum</li>
      </ul>

      <h2>6. Tes droits</h2>
      <p>
        Conformément au RGPD et à la loi « Informatique et Libertés », tu disposes des droits
        d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de
        portabilité de tes données, ainsi que du droit de retirer ton consentement à tout moment.
      </p>
      <p>
        Pour les exercer, écris à <a href={`mailto:${brand.email}`}>{brand.email}</a>. Une réponse te
        sera apportée dans un délai maximum d&apos;un mois. Tu peux également introduire une
        réclamation auprès de la CNIL —{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          www.cnil.fr
        </a>
        .
      </p>

      <h2>7. Sécurité</h2>
      <p>
        Le site est servi exclusivement en HTTPS. L&apos;accès aux données est limité à
        l&apos;éditrice et protégé par des mots de passe robustes et une authentification à deux
        facteurs sur les outils utilisés.
      </p>
    </LegalPage>
  );
}
