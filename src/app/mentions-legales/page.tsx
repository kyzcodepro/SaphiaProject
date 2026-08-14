import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { brand } from "@/content/site.config";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mentions légales",
  description: `Mentions légales du site ${brand.url} : éditeur, hébergeur, propriété intellectuelle et responsabilité.`,
  path: "/mentions-legales",
});

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updatedAt="14 août 2026">
      <h2>1. Éditeur du site</h2>
      <p>
        Le présent site est édité par&nbsp;: <strong>{"{{ Prénom NOM }}"}</strong>, exerçant sous le
        nom commercial <strong>{brand.legalName}</strong>.
      </p>
      <ul>
        <li>Statut juridique : {"{{ entrepreneur individuel / micro-entreprise / SASU… }}"}</li>
        <li>Adresse du siège : {"{{ adresse complète }}"}</li>
        <li>SIREN / SIRET : {"{{ numéro }}"}</li>
        <li>Numéro de TVA intracommunautaire : {"{{ numéro ou « TVA non applicable, art. 293 B du CGI » }}"}</li>
        <li>Email : {brand.email}</li>
        <li>Téléphone : {"{{ numéro }}"}</li>
        <li>Directrice de la publication : {"{{ Prénom NOM }}"}</li>
      </ul>

      <h2>2. Hébergement</h2>
      <p>Le site est hébergé par&nbsp;:</p>
      <ul>
        <li>{"{{ Nom de l'hébergeur — ex. Vercel Inc. }}"}</li>
        <li>{"{{ Adresse de l'hébergeur }}"}</li>
        <li>{"{{ Site / téléphone de l'hébergeur }}"}</li>
      </ul>

      <h2>3. Nature de l&apos;activité</h2>
      <p>
        Les prestations proposées relèvent de l&apos;accompagnement en développement personnel et du
        coaching de vie. Elles ne constituent{" "}
        <strong>ni un acte médical, ni une psychothérapie, ni un avis juridique ou financier</strong>{" "}
        et ne se substituent en aucun cas à un suivi par un professionnel de santé. En cas de
        souffrance psychique, il est recommandé de consulter un médecin ou un psychologue.
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur ce site (textes, images, photographies, logo,
        méthode, ebook, supports pédagogiques) est protégé par le droit de la propriété
        intellectuelle et demeure la propriété exclusive de l&apos;éditrice, sauf mention contraire.
      </p>
      <p>
        Toute reproduction, représentation, diffusion ou adaptation, totale ou partielle, sans
        autorisation écrite préalable, est interdite et susceptible de constituer une contrefaçon au
        sens des articles L.335-2 et suivants du Code de la propriété intellectuelle.
      </p>

      <h2>5. Responsabilité</h2>
      <p>
        L&apos;éditrice s&apos;efforce de fournir des informations exactes et à jour, sans garantir
        leur exhaustivité. Elle ne saurait être tenue responsable des dommages résultant d&apos;une
        indisponibilité temporaire du site, d&apos;une erreur de contenu, ou de l&apos;usage fait par
        l&apos;utilisateur des informations et conseils délivrés, la personne accompagnée restant
        seule décisionnaire de ses choix.
      </p>

      <h2>6. Liens externes</h2>
      <p>
        Ce site contient des liens vers des services tiers (Calendly, Stripe, PayPal, Zoom,
        WhatsApp, TikTok, Instagram). L&apos;éditrice n&apos;exerce aucun contrôle sur ces sites et
        décline toute responsabilité quant à leur contenu et à leurs pratiques en matière de données
        personnelles.
      </p>

      <h2>7. Médiation de la consommation</h2>
      <p>
        Conformément à l&apos;article L.612-1 du Code de la consommation, tout consommateur a le
        droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution
        amiable d&apos;un litige. Le médiateur compétent est&nbsp;: {"{{ nom et coordonnées du médiateur }}"}.
      </p>
      <p>
        La plateforme européenne de règlement en ligne des litiges est accessible à l&apos;adresse{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>

      <h2>8. Droit applicable</h2>
      <p>
        Le présent site et son utilisation sont régis par le droit français. Tout litige relatif à
        son utilisation relève de la compétence des tribunaux français.
      </p>
    </LegalPage>
  );
}
