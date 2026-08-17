# Saphia — site d'accompagnement & réservation

Site vitrine et moteur de conversion pour une activité d'accompagnement mindset :
présentation des offres, réservation en ligne via Calendly, paiement Stripe et
PayPal avant confirmation, vente d'un ebook en téléchargement protégé, pages
légales et suivi analytique.

Le site est construit à partir du PRD « Site web d'accompagnement & réservation »
et couvre le périmètre **MVP (§42)**. Les références `§n` présentes dans le code
renvoient aux sections de ce PRD.

---

## Sommaire

- [Démarrage rapide](#démarrage-rapide)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Parcours de réservation](#parcours-de-réservation)
- [Configuration des services](#configuration-des-services)
- [Modifier le contenu du site](#modifier-le-contenu-du-site)
- [Tester le site](#tester-le-site)
- [Déploiement](#déploiement)
- [Couverture du MVP](#couverture-du-mvp)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

---

## Démarrage rapide

```bash
npm install
cp .env.example .env.local   # puis compléter les valeurs
npm run dev                  # http://localhost:3000
```

Autres commandes :

```bash
npm run build      # build de production
npm start          # serveur de production
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

Le site démarre et fonctionne **sans aucune clé configurée** : les pages
s'affichent, les formulaires se valident, et les fonctionnalités nécessitant un
service externe affichent un message explicite plutôt qu'une erreur.

---

## Stack technique

| Élément | Choix | Pourquoi |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Rendu serveur pour le SEO, routes API pour les paiements |
| Langage | TypeScript strict | Fiabilité sur les montants et les données client |
| Styles | Tailwind CSS v4 | Design system par variables, mobile-first |
| Réservation | Calendly (widget inline) | Règles de disponibilité, confirmations et rappels natifs |
| Paiement | Stripe Checkout + PayPal Orders v2 | Appels REST directs, aucune donnée bancaire sur le site |
| Emails | Resend | Questionnaire préalable, ebook, contact |
| Analytics | Plausible ou GA4 | Suivi du tunnel de conversion (§39) |

Aucun SDK de paiement n'est installé : les intégrations passent par `fetch`, ce
qui réduit la surface de dépendances et les mises à jour de sécurité à suivre.

---

## Structure du projet

```
src/
├─ app/
│  ├─ page.tsx                        Accueil (§7)
│  ├─ accompagnements/                Liste + page détaillée par offre (§8)
│  ├─ reserver/                       Cartes de réservation (§9)
│  │  └─ [slug]/                      Tunnel de réservation (§10, §11)
│  ├─ reservation-confirmee/          Page de confirmation personnalisée (§22)
│  ├─ ebook/                          Page ebook (§19, §20, §21)
│  ├─ contact/                        Contact multi-canal (§24)
│  ├─ cgv/ mentions-legales/ …        Pages légales (§40)
│  └─ api/
│     ├─ checkout/stripe              Création de session Stripe
│     ├─ checkout/paypal              Création d'ordre PayPal
│     ├─ checkout/verify              Vérification serveur du paiement
│     ├─ webhooks/stripe              Filet de sécurité paiement
│     ├─ prebooking                   Questionnaire préalable (§15)
│     ├─ contact                      Formulaire de contact
│     └─ ebook                        Envoi de l'ebook
├─ components/
│  ├─ booking/                        BookingFlow, PrebookingForm, PaymentStep
│  ├─ CalendlyEmbed.tsx               Widget Calendly + événement de confirmation
│  └─ …                               Header, Footer, cartes, UI partagée
├─ content/site.config.ts             ⭐ TOUT le contenu modifiable
└─ lib/                               validation, emails, paiements, SEO, analytics
```

---

## Parcours de réservation

### Appel découverte (gratuit)

```
/reserver/appel-decouverte → questionnaire → Calendly → /reservation-confirmee
```

### Séance payante (50 € / 100 €)

```
/reserver/<offre> → questionnaire → paiement (Stripe ou PayPal)
                 → vérification serveur → Calendly → /reservation-confirmee
```

**Le paiement précède toujours le choix du créneau.** Au retour de Stripe ou de
PayPal, le site interroge directement le fournisseur (`/api/checkout/verify`)
pour confirmer l'encaissement **et vérifier que le montant correspond bien à la
prestation** avant d'afficher le calendrier. Un client ne peut donc pas se
déclarer payé lui-même, et un paiement échoué ne réserve aucun créneau (§11).

Les montants ne transitent jamais par le navigateur : ils sont toujours relus
depuis `site.config.ts` côté serveur au moment de créer le paiement.

Si le client ferme son onglet juste après avoir payé, le webhook Stripe
(`/api/webhooks/stripe`) notifie tout de même l'accompagnatrice, qui peut
relancer la personne pour qu'elle choisisse son créneau.

### Ebook (9,90 €)

```
/ebook → prénom + email → paiement → vérification serveur
       → lien de téléchargement affiché et envoyé par email
```

Le PDF n'est **jamais** servi depuis `public/` : il vit dans `private/` (non
versionné) ou sur un stockage privé, et transite par `/api/ebook/download`, qui
revérifie le paiement auprès de Stripe ou PayPal **à chaque téléchargement**. Un
lien partagé sans paiement valide ne donne rien.

Mettre `ebook.price` à `0` dans la configuration rebascule automatiquement le
produit en téléchargement gratuit contre un email. Voir
[docs/EBOOK.md](docs/EBOOK.md).

---

## Configuration des services

La configuration pas à pas de Calendly, Stripe, PayPal, Resend et de
l'analytique est détaillée dans **[docs/ADMINISTRATION.md](docs/ADMINISTRATION.md)**.
En résumé :

1. **Calendly** — créer trois types d'événement (30 / 60 / 120 min) avec délai de
   24 h, buffer de 15 min, disponibilités lundi-samedi, et une première question
   personnalisée « Comment souhaites-tu échanger ? » (Zoom / WhatsApp).
2. **Stripe** — renseigner la clé secrète et déclarer le webhook
   `https://<domaine>/api/webhooks/stripe`.
3. **PayPal** — créer une application et renseigner l'identifiant et le secret.
4. **Resend** — vérifier le domaine d'envoi et renseigner la clé API.

---

## Modifier le contenu du site

Tout le contenu éditorial vit dans **`src/content/site.config.ts`** : offres,
tarifs, durées, textes, témoignages, ebook, liens sociaux, horaires affichés,
questions fréquentes. Modifier ce fichier suffit — aucune autre partie du code
n'a besoin d'être touchée.

⚠️ Avant d'écrire un nouveau texte, lire **[docs/VOIX-DE-MARQUE.md](docs/VOIX-DE-MARQUE.md)** :
les contenus du site reprennent la manière d'écrire de Saphia telle qu'elle
apparaît dans son ebook (tutoiement, adresse au féminin, phrases courtes,
recadrages en deux temps, aucun jargon).

Les **disponibilités réelles** (créneaux, congés, plages bloquées) se gèrent
directement dans Calendly, sans intervention sur le site.

Les emplacements marqués `À DÉFINIR` correspondent aux points laissés ouverts par
le PRD (§45) et doivent être complétés avant la mise en production.

### Images

| Fichier | Rôle |
| --- | --- |
| `public/images/portrait.svg` | Photo de la page d'accueil — à remplacer par une photo professionnelle |
| `public/images/ebook-cover.svg` | Couverture de l'ebook |
| `private/…pdf` | Fichier de l'ebook — **hors de `public/`**, voir [docs/EBOOK.md](docs/EBOOK.md) |
| `public/icon.svg` | Favicon |

Les deux images sont des placeholders SVG. Après remplacement par des `.jpg`,
mettre à jour les chemins `hero.image` et `ebook.cover` dans `site.config.ts`.

---

## Tester le site

Le protocole complet est dans **[docs/TESTS.md](docs/TESTS.md)** : ce qui se
teste sans aucun compte, comment dérouler le parcours de bout en bout avec
Calendly, les cartes de test Stripe et le sandbox PayPal, puis la checklist
d'avant-ouverture.

⚠️ Pour tester les paiements en local, `NEXT_PUBLIC_SITE_URL` doit valoir
`http://localhost:3000` — sinon Stripe et PayPal renvoient le client vers le
domaine de production après le paiement.

---

## Déploiement

Le projet est prévu pour Vercel, mais fonctionne sur tout hébergeur supportant
Node.js 20+.

### Montrer une préversion avant l'ouverture

Pour faire relire le site à la cliente, un déploiement suffit : Vercel fournit
une adresse publique, sans domaine ni configuration de paiement.

Une seule précaution — **empêcher le référencement**. Une préversion contient
des textes provisoires et des mentions légales incomplètes ; la voir apparaître
dans Google serait un problème.

```env
SITE_NOINDEX=1        # robots.txt bloquant + balise noindex sur toutes les pages
```

Les déploiements de *préversion* Vercel (branche ≠ production) sont détectés
automatiquement et n'ont pas besoin de cette variable. Elle reste nécessaire si
la branche est déployée en production sur une adresse `.vercel.app`.

Le jour du lancement, retirer la variable — c'est ce qui rouvre l'indexation.

### Mise en production

1. Connecter le dépôt à Vercel (framework détecté automatiquement).
2. Renseigner les variables d'environnement de `.env.example` dans le projet
   Vercel.
3. Déployer, puis brancher le domaine définitif.
4. Mettre à jour `NEXT_PUBLIC_SITE_URL` avec le domaine final et déclarer le
   webhook Stripe sur cette URL.
5. Déclarer le site et soumettre `sitemap.xml` dans la Google Search Console.

---

## Couverture du MVP

Critères d'acceptation du PRD (§44) :

| Critère | État |
| --- | --- |
| Consulter les différentes prestations | ✅ |
| Réserver l'appel découverte de 30 min gratuit | ✅ |
| Réserver une séance d'une heure | ✅ |
| Réserver une séance de deux heures | ✅ |
| Paiement obligatoire pour les séances payantes | ✅ vérifié côté serveur |
| Stripe disponible | ✅ à activer avec les clés |
| PayPal disponible | ✅ à activer avec les clés |
| Pas de rendez-vous à moins de 24 h | ✅ règle Calendly, affichée sur le site |
| 15 min entre deux rendez-vous | ✅ buffer Calendly |
| Disponibilités lundi-samedi uniquement | ✅ règle Calendly |
| Informations client recueillies avant le rendez-vous | ✅ questionnaire §15 |
| Choix Zoom ou WhatsApp | ✅ transmis à Calendly |
| Confirmation automatique | ✅ envoyée par Calendly |
| Au moins un rappel avant la séance | ✅ rappels Calendly (24 h + 2 h) |
| Redirection vers une page personnalisée | ✅ `/reservation-confirmee` |
| Ebook accessible depuis le site | ✅ |
| Accès facile à l'ebook depuis TikTok | ✅ `/ebook` + tunnel vers l'appel découverte |
| Fonctionnement sur smartphone | ✅ conception mobile-first |
| Horaires et disponibilités modifiables par l'administratrice | ✅ via Calendly |

Les éléments marqués « à activer avec les clés » sont entièrement implémentés :
seule la saisie des identifiants des comptes Stripe et PayPal est requise.

---

## Ce qui reste à faire

**Avant la mise en production**

- Déposer le PDF de l'ebook (`private/` ou `EBOOK_FILE_URL`) et corriger le
  lien de réservation resté à l'état de gabarit en page 17 du fichier — voir
  [docs/EBOOK.md](docs/EBOOK.md).
- Remplacer les trois témoignages de démonstration, ou vider le tableau
  `testimonials` : la section disparaît alors du site. Publier de faux avis est
  une pratique commerciale trompeuse.
- Compléter les informations légales (identité, SIREN, hébergeur, médiateur)
  dans les pages `mentions-legales`, `cgv` et `annulation-et-remboursement` :
  elles contiennent des marqueurs `{{ … }}` explicites. Une relecture par un
  professionnel du droit est recommandée.
- Remplacer les textes, photos et témoignages de démonstration.
- Créer les comptes Calendly, Stripe, PayPal et Resend, puis renseigner les
  variables d'environnement.
- Définir le contenu, le tarif et les modalités des programmes 6 et 12 mois.

**Version 2 (§43), hors périmètre MVP**

Espace client, abonnements et prélèvements automatiques, réservation réservée aux
abonnés, suivi et historique des séances, ressources privées. Ces fonctionnalités
nécessitent une base de données et une authentification, non requises par le MVP.
