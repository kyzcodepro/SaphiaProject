import { NextResponse } from "next/server";
import { brand, ebook } from "@/content/site.config";
import { adminEmail, definitionList, emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { ebookSchema } from "@/lib/validation";
import { siteOrigin } from "@/lib/request";

/**
 * Distribution de l'ebook (§19, §20, §21).
 *
 * Le visiteur laisse son prénom et son email, reçoit le lien de téléchargement,
 * puis se voit proposer l'appel découverte — c'est l'entrée du tunnel
 * TikTok → Ebook → Appel découverte → Accompagnement.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = ebookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire incomplet." }, { status: 400 });
  }

  // Champ piège rempli : robot silencieusement ignoré.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true, downloadUrl: null });
  }

  const origin = siteOrigin(request);
  const downloadUrl = new URL(ebook.fileUrl, origin).toString();
  const bookingUrl = new URL("/reserver/appel-decouverte", origin).toString();

  // Envoi du lien au lecteur.
  await sendEmail({
    to: parsed.data.email,
    subject: `Ton ebook « ${ebook.title} » est prêt`,
    html: emailLayout(
      `Bonjour ${parsed.data.firstName} 👋`,
      `<p>Merci pour ton intérêt. Voici ton exemplaire de <strong>${escapeHtml(
        ebook.title,
      )}</strong> :</p>
       <p style="margin:24px 0;">
         <a href="${downloadUrl}" style="display:inline-block;background:#5b3a4a;color:#fbf7f2;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:600;">Télécharger l'ebook</a>
       </p>
       <p>Prends le temps de le lire, et surtout : applique une seule chose à la fois. C'est ce qui fait la différence.</p>
       <p style="margin-top:24px;"><strong>Tu veux aller plus loin ?</strong><br />
       Je propose un appel découverte de 30 minutes, gratuit et sans engagement, pour faire le point sur ta situation.</p>
       <p style="margin:20px 0;">
         <a href="${bookingUrl}" style="display:inline-block;border:1px solid #5b3a4a;color:#5b3a4a;padding:13px 25px;border-radius:999px;text-decoration:none;font-weight:600;">Réserver 30 minutes gratuitement</a>
       </p>
       <p style="font-size:13px;color:#6b6058;margin-top:24px;">Tu reçois cet email parce que tu as demandé l'ebook sur ${escapeHtml(
         brand.url,
       )}. Tu peux te désinscrire à tout moment en répondant à cet email.</p>`,
    ),
  });

  // Notification interne.
  await sendEmail({
    to: adminEmail(),
    subject: `Ebook demandé — ${parsed.data.firstName}`,
    html: emailLayout(
      "Nouvelle demande d'ebook",
      definitionList([
        ["Prénom", parsed.data.firstName],
        ["Email", parsed.data.email],
        [
          "Provenance",
          Object.entries(parsed.data.attribution ?? {})
            .map(([key, value]) => `${key}=${value}`)
            .join(" · ") || undefined,
        ],
      ]),
    ),
  });

  // Le lien est également renvoyé pour un téléchargement immédiat depuis la page.
  return NextResponse.json({ ok: true, downloadUrl: ebook.fileUrl });
}
