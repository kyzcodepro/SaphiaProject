# ⚠️ Ne pas placer l'ebook payant ici

Tout fichier présent dans `public/` est accessible publiquement, sans paiement.

Le PDF de l'ebook doit être placé dans le dossier **`private/`** à la racine du
projet, ou hébergé sur un stockage privé via la variable `EBOOK_FILE_URL`.
Il est alors servi par `/api/ebook/download`, qui revérifie le paiement auprès
de Stripe ou PayPal avant chaque téléchargement.

Voir **docs/EBOOK.md**.

Ce dossier ne sert qu'aux ressources librement téléchargeables (extrait gratuit,
sommaire, etc.).
