import { NextResponse } from "next/server";
import { formatDuration, formatPrice, getOffer } from "@/content/site.config";
import { adminEmail, definitionList, emailLayout, escapeHtml, sendEmail } from "@/lib/email";
import { prebookingSchema } from "@/lib/validation";

/**
 * Réception du questionnaire préalable (§15).
 *
 * Les réponses sont envoyées par email à l'accompagnatrice afin qu'elle prépare
 * la séance. Aucune donnée n'est stockée sur le serveur : conformément au
 * principe de minimisation (§40), l'email reste le seul support de conservation.
 */

const familyLabels: Record<string, string> = {
  celibataire: "Célibataire",
  "en-couple": "En couple",
  marie: "Marié(e)",
  separe: "Séparé(e)",
  parent: "Parent",
  "non-communique": "Préfère ne pas répondre",
};

const professionalLabels: Record<string, string> = {
  salarie: "Salarié(e)",
  entrepreneur: "Entrepreneur(e)",
  etudiant: "Étudiant(e)",
  "recherche-emploi": "En recherche d'emploi",
  autre: "Autre",
  "non-communique": "Préfère ne pas répondre",
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = prebookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire incomplet." }, { status: 400 });
  }

  const data = parsed.data;
  const offer = getOffer(data.offerSlug);
  if (!offer) {
    return NextResponse.json({ error: "Prestation inconnue." }, { status: 404 });
  }

  const attribution = Object.entries(data.attribution ?? {})
    .map(([key, value]) => `${key}=${value}`)
    .join(" · ");

  const result = await sendEmail({
    to: adminEmail(),
    replyTo: data.email,
    subject: `Questionnaire préalable — ${offer.name} — ${data.firstName} ${data.lastName}`,
    html: emailLayout(
      `${offer.name} · ${formatDuration(offer.durationMinutes)} · ${formatPrice(offer.price)}`,
      definitionList([
        ["Prénom & nom", `${data.firstName} ${data.lastName}`],
        ["Email", data.email],
        ["Téléphone", data.phone],
        ["Mode du rendez-vous", data.meetingMode === "zoom" ? "Zoom" : "WhatsApp"],
        [
          "Situation familiale",
          data.familySituation ? familyLabels[data.familySituation] : undefined,
        ],
        ["Nombre d'enfants", data.childrenCount],
        [
          "Situation professionnelle",
          data.professionalSituation ? professionalLabels[data.professionalSituation] : undefined,
        ],
        ["Ce qu'elle/il aimerait changer", data.goal],
        ["Principal blocage", data.blocker],
        ["Attentes", data.expectations],
        ["Informations complémentaires", data.extra],
        ["Provenance", attribution || undefined],
      ]) +
        `<p style="margin-top:18px;font-size:13px;color:#6b6058;">Réponds directement à cet email pour écrire à ${escapeHtml(
          data.firstName,
        )}.</p>`,
    ),
  });

  // Un échec d'envoi ne doit jamais bloquer la réservation : le créneau
  // Calendly reste réservable et la confirmation part depuis Calendly.
  return NextResponse.json({ ok: true, notified: result.sent });
}
