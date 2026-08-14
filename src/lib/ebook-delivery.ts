import { brand, ebook } from "@/content/site.config";
import { adminEmail, definitionList, emailLayout, escapeHtml, sendEmail } from "@/lib/email";

/**
 * Livraison de l'ebook après achat (§19, §21).
 *
 * Le lien envoyé pointe vers /api/ebook/download, qui revérifie le paiement
 * auprès de Stripe ou PayPal avant d'envoyer le fichier. Le PDF n'est jamais
 * exposé à une URL publique devinable.
 */

export function downloadUrl(
  origin: string,
  provider: "stripe" | "paypal",
  reference: string,
): string {
  const url = new URL("/api/ebook/download", origin);
  url.searchParams.set("provider", provider);
  url.searchParams.set("ref", reference);
  return url.toString();
}

/** Envoie l'ebook au lecteur, puis propose l'appel découverte (§21). */
export async function sendEbookToBuyer(params: {
  to: string;
  firstName?: string;
  link: string;
  origin: string;
}): Promise<void> {
  const greeting = params.firstName ? `Bonjour ${params.firstName} 👋` : "Bonjour 👋";
  const bookingUrl = new URL("/reserver/appel-decouverte", params.origin).toString();

  await sendEmail({
    to: params.to,
    subject: `Ton ebook « ${ebook.title} »`,
    html: emailLayout(
      greeting,
      `<p>Merci pour ta confiance. Voici ton exemplaire de <strong>${escapeHtml(
        ebook.title,
      )}</strong>&nbsp;:</p>
       <p style="margin:24px 0;">
         <a href="${params.link}" style="display:inline-block;background:#5b3a4a;color:#fbf7f2;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:600;">Télécharger mon ebook</a>
       </p>
       <p style="font-size:13px;color:#6b6058;">Ce lien t'est personnel. Garde cet email : tu pourras retélécharger le guide quand tu veux.</p>
       <p style="margin-top:24px;">Un conseil avant de commencer&nbsp;: ne cherche pas à tout appliquer d'un coup. Prends un chapitre, réponds aux questions de fin, et laisse-le infuser. C'est ce qui fait la différence.</p>
       <p style="margin-top:24px;"><strong>Et si tu veux aller plus loin&nbsp;?</strong><br />
       Je propose un appel découverte de 30 minutes, gratuit et sans engagement, pour poser des mots sur ce que tu traverses.</p>
       <p style="margin:20px 0;">
         <a href="${bookingUrl}" style="display:inline-block;border:1px solid #5b3a4a;color:#5b3a4a;padding:13px 25px;border-radius:999px;text-decoration:none;font-weight:600;">Réserver 30 minutes gratuitement</a>
       </p>
       <p style="font-size:13px;color:#6b6058;margin-top:24px;">Tu reçois cet email suite à ton achat sur ${escapeHtml(
         brand.url,
       )}. Pour toute question, réponds simplement à ce message.</p>`,
    ),
  });
}

/** Prévient l'accompagnatrice d'une nouvelle vente d'ebook. */
export async function notifyEbookSale(params: {
  email?: string;
  firstName?: string;
  amount: string;
  method: string;
  reference: string;
}): Promise<void> {
  await sendEmail({
    to: adminEmail(),
    subject: `Ebook vendu — ${params.amount}`,
    html: emailLayout(
      "Nouvelle vente d'ebook",
      definitionList([
        ["Ebook", ebook.title],
        ["Montant", params.amount],
        ["Moyen de paiement", params.method],
        ["Acheteuse", params.firstName || undefined],
        ["Email", params.email || undefined],
        ["Référence", params.reference],
      ]) +
        `<p style="margin-top:18px;">L'ebook a été envoyé automatiquement par email, avec un lien de téléchargement personnel.</p>`,
    ),
  });
}
