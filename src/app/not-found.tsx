import Link from "next/link";
import { Section } from "@/components/ui";

export default function NotFound() {
  return (
    <Section tone="cream">
      <div className="mx-auto max-w-xl py-10 text-center">
        <span className="eyebrow">Erreur 404</span>
        <h1 className="mt-3 text-4xl leading-tight text-ink md:text-5xl">
          Cette page n&apos;existe pas
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Le lien est peut-être ancien, ou l&apos;adresse comporte une erreur. Voici par où
          continuer.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            Retour à l&apos;accueil
          </Link>
          <Link href="/reserver" className="btn btn-secondary">
            Voir les prestations
          </Link>
        </div>
      </div>
    </Section>
  );
}
