import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { brand } from "@/content/site.config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Politique de cookies",
  description:
    "Quels cookies sont utilisés sur le site, à quoi ils servent, et comment les accepter ou les refuser.",
  path: "/politique-de-cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage
      title="Politique de cookies"
      intro="Ce site utilise le strict minimum. Aucun cookie publicitaire, aucun traceur revendu à des tiers."
      updatedAt="14 août 2026"
    >
      <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier déposé sur ton appareil lors de la visite d&apos;un site. Il
        permet notamment de mémoriser des préférences ou de mesurer la fréquentation.
      </p>

      <h2>2. Cookies utilisés</h2>

      <h3>Cookies strictement nécessaires</h3>
      <p>
        Ils assurent le fonctionnement du site (sécurité, mémorisation temporaire du formulaire de
        réservation dans ton navigateur). Ils ne nécessitent pas de consentement et ne servent à
        aucun suivi publicitaire. Les informations saisies avant un paiement sont conservées dans le
        stockage de session de ton navigateur et effacées dès la réservation terminée.
      </p>

      <h3>Mesure d&apos;audience</h3>
      <p>
        Les statistiques de fréquentation sont collectées de manière anonyme et agrégée. Si un outil
        déposant des cookies (Google Analytics) est activé, un bandeau te demande explicitement ton
        accord&nbsp;: tant que tu n&apos;as pas accepté, aucune mesure n&apos;est effectuée. Ton
        choix est mémorisé localement dans ton navigateur et peut être modifié à tout moment en
        effaçant les données du site.
      </p>

      <h3>Cookies déposés par des services tiers</h3>
      <p>
        Certaines pages intègrent des services externes qui déposent leurs propres cookies lorsque tu
        les utilises&nbsp;:
      </p>
      <ul>
        <li>
          <strong>Calendly</strong> — calendrier de réservation intégré aux pages de réservation.
        </li>
        <li>
          <strong>Stripe</strong> et <strong>PayPal</strong> — pages de paiement sécurisées, y
          compris à des fins de détection de fraude.
        </li>
      </ul>
      <p>
        Ces cookies sont soumis aux politiques de confidentialité de ces prestataires, consultables
        sur leurs sites respectifs.
      </p>

      <h2>3. Gérer ton choix</h2>
      <p>
        Tu peux à tout moment configurer ton navigateur pour bloquer ou supprimer les cookies. Le
        blocage des cookies strictement nécessaires peut empêcher la réservation en ligne de
        fonctionner correctement.
      </p>

      <h2>4. Contact</h2>
      <p>
        Pour toute question relative aux cookies&nbsp;:{" "}
        <a href={`mailto:${brand.email}`}>{brand.email}</a>.
      </p>
    </LegalPage>
  );
}
