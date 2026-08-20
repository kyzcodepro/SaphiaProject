import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Génère le PDF de l'ebook à partir de `ebook.html`.
 *
 *   npm run build                          → valeurs par défaut
 *   npm run build -- --url https://…       → lien de réservation
 *   npm run build -- --email contact@…     → adresse de contact
 *   npm run build -- --out ../../private/mon-ebook.pdf
 *
 * Le fichier est écrit dans `private/` : hors du dossier public, il n'est
 * téléchargeable qu'après paiement (voir docs/EBOOK.md).
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..", "..");

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const bookingUrl = option(
  "url",
  "https://originallife.fr/reserver/appel-decouverte?utm_source=ebook&utm_medium=cta",
);
const email = option("email", "contact@originallife.fr");
const output = path.resolve(
  projectRoot,
  option("out", "private/reprendre-le-controle-de-ta-vie-emotionnelle.pdf"),
);

// Libellé affiché sous le bouton : l'adresse lisible, sans les paramètres UTM.
const bookingLabel = bookingUrl.split("?")[0].replace(/^https?:\/\//, "");

const html = (await readFile(path.join(here, "ebook.html"), "utf8"))
  .replaceAll("__BOOKING_URL__", bookingUrl)
  .replaceAll("__BOOKING_LABEL__", bookingLabel)
  .replaceAll("__EMAIL__", email)
  .replaceAll("__YEAR__", String(new Date().getFullYear()));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage();

// `networkidle` laisse le temps aux polices Google de se charger : sans elles,
// la mise en page tomberait sur des polices de substitution.
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);

/*
 * Pieds de page générés automatiquement : ajouter, supprimer ou déplacer une
 * page ne demande aucune renumérotation manuelle. La couverture et la dernière
 * page (`data-folio="none"`) restent sans numéro, comme le veut l'usage.
 */
await page.evaluate(() => {
  document.querySelectorAll(".page").forEach((element, index) => {
    if (element.getAttribute("data-folio") === "none") return;
    const folio = document.createElement("div");
    folio.className = "folio";
    folio.innerHTML =
      `<span>${element.getAttribute("data-section") ?? ""}</span><span>${index + 1}</span>`;
    element.appendChild(folio);
  });
});

/* Garde-fou : aucune page ne doit déborder de son cadre. */
const overflowing = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".page"))
    .map((element, index) => ({ index: index + 1, overflow: element.scrollHeight - element.clientHeight }))
    .filter((entry) => entry.overflow > 2),
);

if (overflowing.length > 0) {
  console.error("\n⚠️  Contenu trop long sur ces pages (le texte serait coupé) :");
  for (const entry of overflowing) {
    console.error(`   page ${entry.index} — dépasse de ${entry.overflow} px`);
  }
  console.error("   Alléger le texte, ou déplacer une partie sur une page suivante.\n");
  await browser.close();
  process.exit(1);
}

await mkdir(path.dirname(output), { recursive: true });
const pdf = await page.pdf({
  width: "148mm",
  height: "210mm",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});

await writeFile(output, pdf);
await browser.close();

console.log(`PDF généré : ${output}`);
console.log(`Lien de réservation : ${bookingUrl}`);
