# Générateur du PDF de l'ebook

Le PDF est produit à partir de `ebook.html`. Modifier le texte, relancer la
commande, et le fichier est régénéré à l'identique — aucune mise en page à
refaire à la main.

## Générer

```bash
cd tools/ebook
npm install          # une seule fois
npm run build
```

Le PDF est écrit dans `private/reprendre-le-controle-de-ta-vie-emotionnelle.pdf`,
**hors du dossier public** : il n'est téléchargeable qu'après paiement
(voir [docs/EBOOK.md](../../docs/EBOOK.md)).

### Options

```bash
# Adresse réelle du lien « Je réserve mon appel offert »
npm run build -- --url https://www.saphia.fr/reserver/appel-decouverte?utm_source=ebook

# Adresse de contact affichée en fin de guide
npm run build -- --email contact@saphia.fr

# Autre destination
npm run build -- --out ../../private/ebook-v2.pdf
```

Le lien de réservation par défaut pointe vers `www.saphia.fr`. **À mettre à jour
avec le domaine réel avant toute vente.**

## Modifier le contenu

Tout est dans `ebook.html`, dans l'ordre des pages. Chaque page est un bloc :

```html
<section class="page" data-section="Chapitre 03" id="ch03">
  <span class="eyebrow">Chapitre 03</span>
  <h2>Ce que tu dois arrêter dès maintenant</h2>
  ...
</section>
```

- `data-section` — texte affiché en bas de page, à gauche
- `id` — cible des liens du sommaire
- `data-folio="none"` — page sans numéro (couverture, dernière page)

**Les numéros de page sont calculés automatiquement.** Ajouter, supprimer ou
déplacer une page ne demande aucune renumérotation.

### Éléments disponibles

| Classe | Usage |
| --- | --- |
| `.eyebrow` | Petit intertitre en capitales espacées |
| `.pull` | Citation détachée — réservée aux recadrages en deux temps |
| `.exercise` | Encadré « À toi de jouer » |
| `.rule` | Ligne pointillée pour écrire |
| `.marks` | Liste à puces rondes |
| `.cta` | Bouton cliquable |
| `.small` | Texte secondaire |

Le ton à respecter est décrit dans
[docs/VOIX-DE-MARQUE.md](../../docs/VOIX-DE-MARQUE.md).

## Le garde-fou

Avant d'écrire le PDF, le script mesure chaque page. **Si un texte dépasse du
cadre, la génération s'arrête** avec le numéro de la page concernée :

```
⚠️  Contenu trop long sur ces pages (le texte serait coupé) :
   page 18 — dépasse de 72 px
```

Il faut alors alléger le texte, ou déplacer une partie sur une page suivante.
C'est ce contrôle qui garantit qu'aucune phrase ne sera coupée dans le fichier
vendu.

## Notes techniques

- Format **A5** (148 × 210 mm), comme la version d'origine — confortable à lire
  sur téléphone.
- Polices **Fraunces** et **Inter**, les mêmes que le site : le guide et le site
  forment un ensemble cohérent. Elles sont chargées depuis Google Fonts au
  moment de la génération, ce qui nécessite une connexion internet.
- Le rendu passe par Chromium (Playwright). Les vrais gras sont obtenus par la
  graisse de police, et non en dessinant le texte deux fois — c'est ce qui
  évite les doublons au copier-coller.
