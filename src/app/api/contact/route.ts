import { NextResponse } from "next/server";
import { adminEmail, definitionList, emailLayout, sendEmail } from "@/lib/email";
import { contactSchema } from "@/lib/validation";

/** Formulaire de contact (§24). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire incomplet." }, { status: 400 });
  }

  // Champ piège rempli : robot silencieusement ignoré.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendEmail({
    to: adminEmail(),
    replyTo: parsed.data.email,
    subject: `Message depuis le site — ${parsed.data.subject || parsed.data.name}`,
    html: emailLayout(
      "Nouveau message",
      definitionList([
        ["Nom", parsed.data.name],
        ["Email", parsed.data.email],
        ["Sujet", parsed.data.subject],
        ["Message", parsed.data.message],
      ]),
    ),
  });

  if (!result.sent && !result.skipped) {
    return NextResponse.json(
      { error: "Ton message n'a pas pu être envoyé. Écris-moi directement par email ou WhatsApp." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
