import { NextResponse } from "next/server";
import { ebook } from "@/content/site.config";
import { adminEmail, definitionList, emailLayout, sendEmail } from "@/lib/email";
import { sendEbookToBuyer } from "@/lib/ebook-delivery";
import { ebookSchema } from "@/lib/validation";
import { siteOrigin } from "@/lib/request";

/**
 * Distribution de l'ebook **lorsqu'il est gratuit** (§19, §20, §21).
 *
 * Si un prix est configuré, cette route refuse : l'ebook passe alors par le
 * parcours de paiement (/api/checkout/…), et la livraison est déclenchée par
 * /api/checkout/verify une fois l'encaissement confirmé.
 */
export async function POST(request: Request) {
  if (ebook.price > 0) {
    return NextResponse.json(
      { error: "L'ebook est payant : merci de passer par le paiement en ligne." },
      { status: 400 },
    );
  }

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
  const link = new URL("/api/ebook/download", origin).toString();

  await sendEbookToBuyer({
    to: parsed.data.email,
    firstName: parsed.data.firstName,
    link,
    origin,
  });

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

  return NextResponse.json({ ok: true, downloadUrl: "/api/ebook/download" });
}
