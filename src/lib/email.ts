import { brand } from "@/content/site.config";

/**
 * Envoi d'emails transactionnels via Resend (https://resend.com).
 *
 * Variables d'environnement :
 *  - RESEND_API_KEY : clé API (sans elle, les emails sont simplement journalisés)
 *  - EMAIL_FROM     : expéditeur vérifié, ex. "Saphia <contact@originallife.fr>"
 *  - EMAIL_ADMIN    : adresse recevant les notifications internes
 *
 * Les confirmations et rappels de rendez-vous (§17) sont envoyés par Calendly.
 * Cette couche sert aux emails propres au site : questionnaire préalable,
 * envoi de l'ebook, formulaire de contact, notification de paiement.
 */

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; path: string }[];
};

export type EmailResult = { sent: boolean; skipped?: boolean; error?: string };

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function adminEmail(): string {
  return process.env.EMAIL_ADMIN?.trim() || brand.email;
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM?.trim() || `${brand.name} <${brand.email}>`;

  if (!apiKey) {
    // Mode développement : aucune clé configurée, on n'échoue pas le parcours.
    console.info("[email] RESEND_API_KEY absente — email non envoyé:", options.subject);
    return { sent: false, skipped: true };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
        attachments: options.attachments,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[email] Envoi échoué:", response.status, detail);
      return { sent: false, error: `Resend ${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[email] Erreur réseau:", error);
    return { sent: false, error: "network" };
  }
}

/** Échappe les données utilisateur avant insertion dans un email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Gabarit HTML commun, aux couleurs du site. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="fr">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:24px;background:#fbf7f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#241e1b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e6d7c7;">
      <tr>
        <td style="padding:28px 32px;background:#5b3a4a;color:#fbf7f2;">
          <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.75;">${escapeHtml(brand.name)}</div>
          <div style="font-size:22px;margin-top:6px;font-weight:600;">${escapeHtml(title)}</div>
        </td>
      </tr>
      <tr><td style="padding:28px 32px;font-size:15px;line-height:1.65;color:#3c332e;">${bodyHtml}</td></tr>
      <tr>
        <td style="padding:20px 32px;background:#f2e8dd;font-size:12px;color:#6b6058;">
          ${escapeHtml(brand.legalName)} — <a href="${brand.url}" style="color:#5b3a4a;">${escapeHtml(brand.url)}</a>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Rend un bloc « clé : valeur » pour les notifications internes. */
export function definitionList(entries: [string, string | undefined][]): string {
  return entries
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 10px;"><strong style="color:#241e1b;">${escapeHtml(label)}</strong><br />${escapeHtml(
          value,
        ).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}
