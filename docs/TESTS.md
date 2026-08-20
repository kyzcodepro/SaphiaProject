# Guide de test

Trois niveaux, du plus rapide au plus complet :

1. **Sans aucun compte** — vérifier les pages, les formulaires et le design (5 min)
2. **Avec des comptes de test** — vérifier le parcours de réservation et de paiement de bout en bout (~45 min)
3. **En production** — un dernier tour avant l'ouverture au public

---

## 1. Tester sans aucun compte

```bash
npm install
cp .env.example .env.local
npm run dev
```

### Sous Windows, depuis l'invite de commandes (cmd)

Vérifier d'abord que Node.js est installé — `node -v` doit afficher **v20 ou
plus**. Sinon, installer la version LTS depuis [nodejs.org](https://nodejs.org)
et **rouvrir une nouvelle fenêtre cmd** (le PATH n'est lu qu'au démarrage).

```cmd
cd %USERPROFILE%\Documents
git clone https://github.com/kyzcodepro/SaphiaProject.git
cd SaphiaProject
npm install
copy .env.example .env.local
notepad .env.local
npm run dev
```

Dans le Bloc-notes, renseigner au minimum `NEXT_PUBLIC_SITE_URL=http://localhost:3000`,
enregistrer, fermer. Le site est ensuite accessible sur <http://localhost:3000>.

Pour arrêter le serveur : `Ctrl + C`, puis `O` et Entrée.

> `cp` n'existe pas sous cmd : utiliser `copy`. Les mêmes commandes fonctionnent
> telles quelles dans PowerShell.

Le site tourne sur <http://localhost:3000>. Aucune clé n'est nécessaire : les
fonctionnalités qui dépendent d'un service externe affichent un message explicite
au lieu de planter.

### Ce qui se teste tout de suite

| À vérifier | Comment |
| --- | --- |
| Toutes les pages s'affichent | Parcourir le menu, puis les liens du pied de page |
| Navigation mobile | Réduire la fenêtre à ~390 px, ouvrir le menu burger |
| Validation des formulaires | Envoyer le formulaire de réservation vide → messages d'erreur en français sous chaque champ |
| Email invalide refusé | Saisir `bonjour` dans un champ email |
| Consentement obligatoire | Remplir le questionnaire sans cocher la case → blocage |
| Questions facultatives | Ne remplir que prénom, nom, email et mode de rendez-vous → doit passer |
| Étape suivante correcte | Offre gratuite → calendrier · Offre payante → écran de paiement |
| Paiement non configuré | Cliquer « Carte bancaire » → message clair, pas d'erreur technique |
| Page 404 | Ouvrir <http://localhost:3000/nimporte-quoi> |

Les questionnaires envoyés apparaissent dans le terminal (`[email] RESEND_API_KEY
absente…`) : c'est normal tant qu'aucune clé email n'est configurée.

### Contrôles automatiques

```bash
npm run typecheck   # types TypeScript
npm run lint        # ESLint
npm run build       # build de production complet
```

Les trois doivent passer sans erreur ni avertissement.

---

## 2. Tester le parcours complet avec des comptes de test

### ⚠️ Le réglage à ne pas oublier

Dans `.env.local`, pour des tests en local :

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sans cette ligne, Stripe et PayPal renvoient le client vers le domaine de
production après le paiement, et le test s'arrête là.

### 2.1 Calendly

1. Créer un compte gratuit sur [calendly.com](https://calendly.com).
2. Créer un type d'événement de 30 min avec l'URL `appel-decouverte`.
3. Régler *Minimum scheduling notice* sur **24 heures** et *Buffer after event*
   sur **15 minutes**, disponibilités lundi-samedi.
4. Renseigner dans `.env.local` :
   ```env
   NEXT_PUBLIC_CALENDLY_USERNAME=votre-identifiant-calendly
   ```
   (la partie après `calendly.com/` dans votre lien).
5. Redémarrer `npm run dev`.

> **Le plan gratuit de Calendly ne permet qu'un seul type d'événement.** Pour
> tester les trois prestations, il faut un plan payant, ou tester une offre à la
> fois en réutilisant la même URL d'événement dans `site.config.ts`.

**À vérifier sur `/reserver/appel-decouverte` :**

- [ ] Le calendrier s'affiche à l'étape 3
- [ ] Le prénom, le nom et l'email saisis sont **déjà pré-remplis**
- [ ] Aucun créneau n'est proposé dans les 24 prochaines heures
- [ ] Le dimanche n'apparaît pas
- [ ] Après une réservation de test, le site bascule automatiquement sur
      `/reservation-confirmee` (et non sur la page Calendly par défaut)
- [ ] L'email de confirmation Calendly arrive, avec le lien de connexion
- [ ] Réserver un second créneau : le créneau suivant respecte bien les 15 min de
      battement

Pour vérifier la pause de 15 minutes : après une réservation de 14 h à 15 h, le
créneau de 15 h ne doit plus être proposé — le premier disponible est 15 h 15.

### 2.2 Stripe (mode test)

> **Selon la configuration retenue.** Le champ `sessionPayment` de
> `site.config.ts` vaut `"calendly"` : les séances sont réglées dans Calendly,
> et le parcours de paiement du site ne concerne plus que **l'ebook**. Le
> tableau des cartes ci-dessous s'applique alors sur `/ebook`, pas sur
> `/reserver/…`. Repasser `sessionPayment` sur `"site"` rétablit l'ancien
> parcours et rend ce test valable tel quel.

1. Créer un compte [stripe.com](https://stripe.com) — pas besoin de valider
   l'identité pour le mode test.
2. **Développeurs → Clés API** → copier la clé secrète de test dans
   `STRIPE_SECRET_KEY`.
3. Redémarrer le serveur.

**Parcours à dérouler sur `/reserver/seance-individuelle` :**

| Carte à saisir | Résultat attendu |
| --- | --- |
| `4242 4242 4242 4242` | Paiement accepté → le calendrier s'affiche |
| `4000 0000 0000 0002` | Paiement refusé → retour sur le site, calendrier **non** affiché |
| Bouton « Retour » de Stripe | Message « paiement interrompu », aucun créneau réservé |

Date d'expiration : n'importe quelle date future. CVC : n'importe quels 3 chiffres.

- [ ] Le montant affiché sur la page Stripe est bien de **50 €**
- [ ] Après paiement, le paiement apparaît dans Stripe → Paiements
- [ ] En cas de refus, il est impossible d'atteindre l'étape du calendrier

**Le test qui compte le plus** — vérifier qu'on ne peut pas contourner le
paiement. Ouvrir directement dans le navigateur :

```
http://localhost:3000/reserver/seance-individuelle?payment=stripe&session_id=cs_test_bidon
```

Le site doit afficher un message d'échec et **ne jamais afficher le calendrier**.
C'est la garantie qu'une réservation payante ne peut pas être obtenue sans
paiement réel.

**Webhook** (optionnel, nécessite la CLI Stripe) :

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

La commande affiche un secret `whsec_…` à placer dans `STRIPE_WEBHOOK_SECRET`.
Refaire un paiement de test : un email de notification doit partir vers
`EMAIL_ADMIN`.

### 2.3 PayPal (sandbox)

1. Sur [developer.paypal.com](https://developer.paypal.com) → **Apps &
   Credentials** → onglet **Sandbox** → créer une application.
2. Renseigner `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, et laisser
   `PAYPAL_ENVIRONMENT=sandbox`.
3. Dans **Testing Tools → Sandbox Accounts**, récupérer l'identifiant et le mot
   de passe d'un compte acheteur de test.

- [ ] Le bouton PayPal redirige vers la page sandbox
- [ ] Le montant est correct
- [ ] Après paiement, retour sur le site et affichage du calendrier
- [ ] Une annulation depuis PayPal ne réserve aucun créneau

### 2.4 Emails

Pour un test rapide sans configurer de domaine : créer un compte
[resend.com](https://resend.com), copier la clé API dans `RESEND_API_KEY` et
utiliser l'expéditeur de test fourni par Resend.

```env
RESEND_API_KEY=votre_cle
EMAIL_FROM="Saphia <onboarding@resend.dev>"
EMAIL_ADMIN=votre.adresse@exemple.fr
```

> Tant que le domaine n'est pas vérifié, Resend n'autorise l'envoi que vers
> l'adresse email du compte. C'est suffisant pour tester.

- [ ] Le questionnaire préalable arrive par email, avec toutes les réponses
- [ ] Répondre à cet email écrit bien au client (adresse en `reply-to`)
- [ ] Le formulaire de contact arrive
- [ ] La demande d'ebook déclenche **deux** emails : le lien pour le lecteur, la
      notification pour l'accompagnatrice

---

## Montrer une préversion à la cliente

Un déploiement Vercel suffit à partager le site sans domaine ni clés de
paiement. Renseigner au minimum, dans les variables du projet Vercel :

```env
NEXT_PUBLIC_SITE_URL=https://<le-projet>.vercel.app
SITE_NOINDEX=1
```

Ce qui ne fonctionnera pas sur une préversion sans clés, et c'est normal :

| Ce qui s'affiche | Pourquoi |
| --- | --- |
| Le calendrier ne charge pas | L'identifiant Calendly est encore fictif |
| « Le paiement n'est pas encore actif » | Aucune clé Stripe ni PayPal |
| Aucun email envoyé | Pas de clé Resend |
| Le téléchargement de l'ebook échoue | Le PDF n'est pas versionné |

Tout le reste — pages, textes, navigation mobile, formulaires et leurs
messages d'erreur — est représentatif du rendu final.

---

## 3. Avant l'ouverture au public

- [ ] `NEXT_PUBLIC_SITE_URL` pointe sur le domaine définitif
- [ ] Clés Stripe **live** et identifiants PayPal **live** en place
- [ ] Webhook Stripe déclaré sur l'URL de production
- [ ] Domaine d'envoi vérifié chez Resend
- [ ] **Une vraie réservation payante effectuée avec une vraie carte**, puis
      remboursée depuis Stripe — c'est le seul test qui valide la chaîne complète
- [ ] Un test sur un vrai téléphone, depuis un lien TikTok ou Linktree
- [ ] Vérification des liens WhatsApp (numéro correct dans `site.config.ts`)
- [ ] Aucun marqueur `{{ … }}` restant dans les pages légales
- [ ] Test de vitesse : [PageSpeed Insights](https://pagespeed.web.dev)
- [ ] Test des données structurées :
      [Rich Results Test](https://search.google.com/test/rich-results)

---

## Récapitulatif des critères du PRD (§44)

| Critère | Comment le vérifier |
| --- | --- |
| Consulter les prestations | Page `/accompagnements` |
| Réserver 30 min gratuites | Parcours complet sans écran de paiement |
| Réserver 1 h / 2 h | Parcours avec paiement obligatoire |
| Paiement requis | URL falsifiée ci-dessus → calendrier inaccessible |
| Stripe / PayPal disponibles | Deux boutons à l'étape paiement |
| Pas de RDV sous 24 h | Aucun créneau proposé aujourd'hui ni demain avant l'heure actuelle |
| 15 min entre deux RDV | Réserver deux créneaux consécutifs |
| Lundi-samedi seulement | Le dimanche n'apparaît jamais |
| Informations recueillies avant | Questionnaire à l'étape 1 |
| Choix Zoom / WhatsApp | Réponse pré-remplie dans Calendly |
| Confirmation automatique | Email Calendly reçu |
| Au moins un rappel | Rappels 24 h et 2 h configurés dans Calendly |
| Page personnalisée après réservation | Redirection vers `/reservation-confirmee` |
| Ebook accessible | Page `/ebook`, formulaire, email reçu |
| Accès facile depuis TikTok | `/ebook?utm_source=tiktok` |
| Fonctionne sur smartphone | Test sur un vrai téléphone |
| Horaires modifiables | Modifier une disponibilité dans Calendly, recharger le site |
