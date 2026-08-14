# Guide d'administration

Ce document s'adresse à la personne qui gère le site au quotidien. Il n'y a pas
besoin de savoir programmer pour la plupart des opérations décrites ici.

---

## 1. Ce qui se modifie où

| Je veux modifier… | Où |
| --- | --- |
| Mes horaires, mes congés, une journée bloquée | **Calendly** |
| Mes tarifs, les descriptions, les textes du site | Fichier `src/content/site.config.ts` |
| Ma photo, la couverture de l'ebook, le PDF | Dossier `public/` |
| Le message de confirmation ou les rappels | **Calendly** |
| Voir mes paiements, faire un remboursement | **Stripe** / **PayPal** |
| Voir les questionnaires remplis par mes clients | Ma **boîte email** |

---

## 2. Calendly — configuration initiale

### 2.1 Créer les trois types d'événement

Dans Calendly → **Event Types** → **Create**. Créer un événement par prestation,
avec exactement ces identifiants d'URL (le site les utilise pour afficher le bon
calendrier) :

| Prestation | Durée | URL Calendly à utiliser |
| --- | --- | --- |
| Appel découverte | 30 min | `.../appel-decouverte` |
| Séance individuelle | 60 min | `.../seance-individuelle` |
| Séance approfondie | 120 min | `.../seance-approfondie` |

> Si un identifiant différent est choisi, il faut le reporter dans le champ
> `calendlyEvent` de l'offre correspondante dans `site.config.ts`.

### 2.2 Réglages communs aux trois événements

Dans chaque événement, onglet **Availability / Scheduling** :

- **Jours et horaires** — lundi au samedi, aux horaires souhaités. Le dimanche
  reste fermé.
- **Minimum scheduling notice** → **24 hours**. C'est la règle « pas de
  rendez-vous à moins de 24 h » (§14 du PRD).
- **Buffer after event** → **15 minutes**. C'est la pause automatique entre deux
  rendez-vous.
- **Date range** — jusqu'à 60 jours dans le futur (recommandé).

### 2.3 La question « Zoom ou WhatsApp »

Le site demande déjà au client s'il préfère Zoom ou WhatsApp, et transmet la
réponse à Calendly. Pour que ce transfert fonctionne, ajouter dans chaque
événement, **en première position** des questions personnalisées
(*Invitee Questions*) :

- Intitulé : `Comment souhaites-tu échanger ?`
- Type : réponse courte ou choix multiple (`Zoom` / `WhatsApp`)

C'est la première question qui reçoit automatiquement la réponse donnée sur le
site. Si l'ordre des questions change, la réponse n'est plus pré-remplie — le
client peut alors la ressaisir, rien n'est cassé.

### 2.4 Confirmations et rappels

Onglet **Notifications and cancellation policy** de chaque événement :

- **Email confirmation** → activé. Il contient la date, l'heure, la durée, le
  lien de connexion et les liens d'annulation/report.
- **Email reminders** → en ajouter deux : **24 heures** avant et **2 heures**
  avant (§17 du PRD).
- **Cancellation policy** → indiquer que l'annulation est possible jusqu'à 24 h
  avant la séance.

### 2.5 Le lien Zoom

Dans **Location** de l'événement, choisir **Zoom** et connecter le compte Zoom :
Calendly crée alors automatiquement un lien de réunion unique pour chaque
rendez-vous et l'insère dans l'email de confirmation.

Pour les rendez-vous WhatsApp, choisir « Phone call » ou « Custom » et indiquer
les instructions à transmettre.

### 2.6 Bloquer des dates

- **Une journée entière ou des vacances** → Calendly → **Availability** →
  ajouter une *Date override* sur la période, en la marquant indisponible.
- **Une plage précise** (ex. mercredi de 14 h à 16 h) → *Date override* sur cette
  journée en ne laissant que les plages réellement disponibles.
- **Un rendez-vous personnel** → il suffit de le poser dans le calendrier Google
  ou Outlook connecté à Calendly : le créneau disparaît automatiquement du site.

Aucune de ces actions ne nécessite d'intervention sur le site.

---

## 3. Stripe — paiements par carte

1. Créer un compte sur [stripe.com](https://stripe.com) et compléter la
   vérification d'identité.
2. **Développeurs → Clés API** : copier la clé secrète dans la variable
   `STRIPE_SECRET_KEY`.
3. **Développeurs → Webhooks → Ajouter un endpoint** :
   - URL : `https://<votre-domaine>/api/webhooks/stripe`
   - Événements : `checkout.session.completed` et
     `checkout.session.async_payment_failed`
   - Copier le secret de signature dans `STRIPE_WEBHOOK_SECRET`.
4. Tester en mode test avec la carte `4242 4242 4242 4242`, une date future et
   n'importe quel CVC.
5. Passer en mode production en remplaçant les clés de test par les clés live.

**Rembourser un client** : Stripe → Paiements → sélectionner le paiement →
*Rembourser*. Aucun effet sur le site ; penser à annuler le rendez-vous dans
Calendly.

---

## 4. PayPal

1. Se connecter à [developer.paypal.com](https://developer.paypal.com) avec le
   compte PayPal professionnel.
2. **Apps & Credentials** → créer une application.
3. Copier `Client ID` et `Secret` dans `PAYPAL_CLIENT_ID` et
   `PAYPAL_CLIENT_SECRET`.
4. Laisser `PAYPAL_ENVIRONMENT=sandbox` pour les tests, puis basculer sur `live`
   avec les identifiants de production.

---

## 5. Emails (Resend)

1. Créer un compte sur [resend.com](https://resend.com).
2. Ajouter le domaine et suivre la procédure de vérification DNS. Cette étape est
   indispensable pour que les emails n'arrivent pas en spam.
3. Copier la clé API dans `RESEND_API_KEY`.
4. Renseigner `EMAIL_FROM` (expéditeur, sur le domaine vérifié) et `EMAIL_ADMIN`
   (adresse qui reçoit les questionnaires et notifications).

Sans clé configurée, le site fonctionne normalement mais aucun email n'est
envoyé. Les confirmations et rappels de rendez-vous, eux, partent toujours de
Calendly.

---

## 6. Suivi de l'activité (analytics)

Deux options, au choix :

- **Plausible** (recommandé) — sans cookie, donc **aucun bandeau de consentement
  n'est nécessaire**. Renseigner `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
- **Google Analytics 4** — gratuit et plus complet, mais dépose des cookies : le
  bandeau de consentement s'affiche alors automatiquement et aucune mesure n'a
  lieu tant que le visiteur n'a pas accepté. Renseigner `NEXT_PUBLIC_GA_ID`.

Les événements suivis correspondent au tunnel décrit au §39 du PRD : consultation
d'une offre, clic sur « réserver », envoi du questionnaire, choix du moyen de
paiement, paiement réussi ou échoué, réservation finalisée, téléchargement de
l'ebook, contact WhatsApp.

**Pour mesurer le trafic TikTok**, utiliser des liens avec paramètres, par
exemple :

```
https://www.saphia.fr/ebook?utm_source=tiktok&utm_medium=bio&utm_campaign=ebook
```

Ces paramètres sont conservés jusqu'à la réservation et transmis à Calendly, ce
qui permet de savoir quelle vidéo a généré quel rendez-vous.

---

## 7. Linktree

Structure recommandée (§23 du PRD), chaque lien pointant vers le site :

| Lien | Destination |
| --- | --- |
| 🌐 Découvrir mon accompagnement | `/accompagnements?utm_source=linktree` |
| 📅 Réserver 30 min gratuitement | `/reserver/appel-decouverte?utm_source=linktree` |
| ✨ Séance mindset 1h | `/reserver/seance-individuelle?utm_source=linktree` |
| 🔥 Séance approfondie 2h | `/reserver/seance-approfondie?utm_source=linktree` |
| 📚 Mon ebook | `/ebook?utm_source=linktree` |
| 💬 Me contacter | `/contact?utm_source=linktree` |

---

## 8. Modifier les textes et les tarifs

Tout se trouve dans un seul fichier : `src/content/site.config.ts`.

Exemple — changer le prix de la séance d'une heure :

```ts
{
  slug: "seance-individuelle",
  name: "Séance individuelle",
  durationMinutes: 60,
  price: 60,        // ← modifier ici (en euros)
  ...
}
```

Le nouveau tarif s'applique partout : cartes d'offres, page détaillée, page de
réservation, CGV, données structurées Google et montant réellement débité.

Après toute modification, enregistrer le fichier et publier les changements
(sur Vercel, un simple `git push` déclenche la mise en ligne).

---

## 9. Checklist avant la mise en ligne

- [ ] Textes, photos et témoignages réels en place
- [ ] Informations légales complétées (marqueurs `{{ … }}` remplacés)
- [ ] Trois événements Calendly créés, avec délai 24 h et buffer 15 min
- [ ] Zoom connecté à Calendly
- [ ] Rappels 24 h et 2 h activés
- [ ] Clés Stripe en mode production, webhook déclaré
- [ ] Identifiants PayPal en mode `live`
- [ ] Domaine d'envoi email vérifié
- [ ] Un test de réservation gratuite effectué de bout en bout
- [ ] Un test de réservation payante effectué, puis remboursé
- [ ] Sitemap soumis à la Google Search Console
