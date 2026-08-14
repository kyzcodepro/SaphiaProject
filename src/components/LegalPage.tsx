import type { ReactNode } from "react";

/** Mise en page commune aux pages légales (§40). */
export function LegalPage({
  title,
  intro,
  updatedAt,
  children,
}: {
  title: string;
  intro?: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-cream">
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <span className="eyebrow">Informations légales</span>
          <h1 className="mt-3 text-4xl leading-tight text-ink md:text-5xl">{title}</h1>
          {intro ? <p className="mt-5 text-base leading-relaxed text-muted">{intro}</p> : null}
          <p className="mt-4 text-sm text-muted">Dernière mise à jour : {updatedAt}</p>

          <div className="prose-legal mt-10">{children}</div>

          <div className="card mt-14 p-6">
            <p className="text-sm leading-relaxed text-muted">
              <strong className="text-ink">À compléter avant la mise en ligne.</strong> Les mentions
              entre doubles accolades <code>{"{{ }}"}</code> doivent être remplacées par les
              informations réelles de l&apos;activité (identité, SIREN, adresse, hébergeur,
              assurance). Ce document constitue une base de travail et ne remplace pas la
              validation d&apos;un professionnel du droit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
