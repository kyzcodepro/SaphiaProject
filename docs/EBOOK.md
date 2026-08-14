# Gérer l'ebook payant

L'ebook « Reprendre le contrôle de ta vie émotionnelle » est vendu **9,90 €**
sur la page `/ebook`. Ce document explique comment le fichier est livré, où le
placer, et comment changer son prix.

---

## Comment fonctionne la vente

```
/ebook → prénom + email → paiement (carte ou PayPal)
       → vérification du paiement côté serveur
       → lien de téléchargement affiché + envoyé par email
```

Le lien pointe vers `/api/ebook/download`, **jamais** directement vers le PDF.
À chaque téléchargement, cette route redemande à Stripe ou PayPal si le paiement
correspondant est bien encaissé, et pour le bon montant. Un lien partagé sans
paiement valide ne donne donc rien.

C'est la raison pour laquelle le PDF **ne doit jamais être placé dans
`public/`** : tout ce qui s'y trouve est téléchargeable librement par qui
connaît l'adresse.

---

## Où placer le fichier

Deux modes, au choix.

### Mode 1 — le fichier dans le projet (le plus simple)

Créer un dossier `private/` à la racine et y déposer le PDF sous le nom attendu :

```
private/reprendre-le-controle-de-ta-vie-emotionnelle.pdf
```

Sous Windows, en `cmd`, depuis le dossier du projet :

```cmd
mkdir private
copy "%USERPROFILE%\Downloads\Reprendrelecontroledetavieemotionnelle.pdf" "private\reprendre-le-controle-de-ta-vie-emotionnelle.pdf"
```

> **`private/` n'est volontairement pas versionné par Git** (voir `.gitignore`).
> Si le dépôt GitHub est public, y committer le PDF reviendrait à offrir le
> produit à tout le monde. Il faut donc déposer le fichier séparément sur
> l'hébergement — ou passer par le mode 2.
>
> Si le dépôt est privé et que vous préférez versionner le fichier, retirez la
> ligne `/private/` de `.gitignore`.

### Mode 2 — le fichier sur un stockage privé

Héberger le PDF ailleurs (Vercel Blob, Amazon S3, Google Cloud Storage…) et
renseigner son adresse :

```env
EBOOK_FILE_URL=https://mon-stockage.exemple/ebook-prive.pdf
```

La route de téléchargement vérifie le paiement, puis redirige vers cette
adresse. Préférer une URL signée à durée limitée si le stockage le permet.

Ce mode est recommandé en production : le fichier ne dépend plus du déploiement,
et le remplacer ne nécessite aucune mise en ligne du site.

---

## Changer le prix

Une seule ligne, dans `src/content/site.config.ts` :

```ts
export const ebook: Ebook = {
  title: "Reprendre le contrôle de ta vie émotionnelle",
  price: 9.9,   // ← ici, en euros
  ...
};
```

Le nouveau prix s'applique partout : page d'accueil, page ebook, bouton
d'achat, CGV, données structurées Google, et **montant réellement débité** —
celui-ci est toujours relu côté serveur, jamais transmis par le navigateur.

**Mettre `price: 0`** transforme l'ebook en produit gratuit : le formulaire
n'affiche plus d'étape de paiement et le fichier part directement par email.
Aucune autre modification n'est nécessaire.

---

## Tester la vente

Avec une clé Stripe de test dans `.env.local` :

1. Ouvrir `/ebook`, renseigner prénom et email, continuer vers le paiement.
2. Payer avec la carte de test `4242 4242 4242 4242`.
3. Vérifier que la page affiche le bouton de téléchargement et que le PDF
   s'ouvre correctement.
4. Vérifier que l'email d'achat est bien reçu.

**Le test qui compte** — copier le lien de téléchargement et remplacer la
référence par une valeur inventée :

```
http://localhost:3000/api/ebook/download?provider=stripe&ref=cs_test_bidon
```

La réponse doit être un refus, jamais le fichier.

---

## Deux corrections à apporter au PDF

Relevées à la lecture du fichier fourni :

1. **Page 17**, le lien de réservation est resté à l'état de gabarit :
   `[Ton lien de réservation ici]`. Le remplacer par l'adresse réelle avant toute
   vente, par exemple :
   `https://www.saphia.fr/reserver/appel-decouverte?utm_source=ebook`
2. **Les titres en gras sont dessinés deux fois** dans le fichier. À l'écran
   c'est invisible, mais au copier-coller le texte apparaît en double
   (« aideaide médico-psychologiquemédico-psychologique »). Les lecteurs
   d'écran lisent aussi ce doublon. À corriger dans l'outil de mise en page en
   utilisant une vraie graisse de police plutôt qu'un faux gras.

---

## Rembourser un acheteur

Depuis Stripe ou PayPal directement. Le site n'a rien à faire : le lien de
téléchargement cessera de fonctionner à la vérification suivante, puisque le
paiement ne sera plus considéré comme encaissé.
