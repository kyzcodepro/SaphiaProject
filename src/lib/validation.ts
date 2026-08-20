import { z } from "zod";

/**
 * Schémas partagés client/serveur.
 *
 * RGPD (§15, §40) : seuls le prénom, le nom, l'email et le consentement sont
 * obligatoires. Toutes les informations relatives à la situation familiale ou
 * professionnelle sont facultatives, conformément au principe de minimisation.
 */

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Ce champ ne peut pas dépasser ${max} caractères.`)
    .optional()
    .or(z.literal("").transform(() => undefined));

/**
 * Téléphone français (§15).
 *
 * L'accompagnement se fait par téléphone ou WhatsApp depuis la France : un
 * numéro étranger ne serait pas joignable. Le champ n'accepte donc que les
 * numéros français, métropole et outre-mer.
 *
 * Les écritures courantes sont tolérées — espaces, points, tirets,
 * parenthèses, indicatif international — puis normalisées en `06 12 34 56 78`
 * pour que l'email reçu soit toujours lisible de la même façon.
 */
const PHONE_SEPARATORS = /[\s.\-()\u00a0\u202f]/g;
const FRENCH_NATIONAL = /^0[1-9]\d{8}$/;

/** Renvoie le numéro au format `06 12 34 56 78`, ou `null` s'il n'est pas français. */
export function normalizeFrenchPhone(value: string): string | null {
  let digits = value.replace(PHONE_SEPARATORS, "");

  if (digits.startsWith("+33")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("0033")) digits = `0${digits.slice(4)}`;
  else if (/^33[1-9]\d{8}$/.test(digits)) digits = `0${digits.slice(2)}`;

  if (!FRENCH_NATIONAL.test(digits)) return null;

  return digits.replace(/(\d{2})(?=\d)/g, "$1 ");
}

const optionalFrenchPhone = z
  .string()
  .trim()
  .max(24, "Ce numéro est trop long.")
  .refine((value) => value === "" || normalizeFrenchPhone(value) !== null, {
    message: "Merci d'indiquer un numéro français, par exemple 06 12 34 56 78.",
  })
  .transform((value) => (value === "" ? undefined : (normalizeFrenchPhone(value) ?? undefined)))
  .optional();

export const meetingModes = ["zoom", "whatsapp"] as const;
export type MeetingMode = (typeof meetingModes)[number];

export const familySituations = [
  "celibataire",
  "en-couple",
  "marie",
  "separe",
  "parent",
  "non-communique",
] as const;

export const professionalSituations = [
  "salarie",
  "entrepreneur",
  "etudiant",
  "recherche-emploi",
  "autre",
  "non-communique",
] as const;

/** Formulaire préalable à la réservation (§15). */
export const prebookingSchema = z.object({
  offerSlug: z.string().min(1).max(60),
  firstName: z.string().trim().min(2, "Merci d'indiquer ton prénom.").max(60),
  lastName: z.string().trim().min(2, "Merci d'indiquer ton nom.").max(60),
  email: z.string().trim().email("Merci d'indiquer une adresse email valide.").max(160),
  phone: optionalFrenchPhone,
  meetingMode: z.enum(meetingModes, {
    errorMap: () => ({ message: "Merci de choisir Zoom ou WhatsApp." }),
  }),
  familySituation: z.enum(familySituations).optional(),
  childrenCount: optionalText(10),
  professionalSituation: z.enum(professionalSituations).optional(),
  goal: optionalText(1500),
  blocker: optionalText(1500),
  expectations: optionalText(1500),
  extra: optionalText(1500),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Merci d'accepter le traitement de tes données pour continuer.",
    }),
  }),
  attribution: z.record(z.string()).optional(),
});

export type PrebookingInput = z.infer<typeof prebookingSchema>;

/** Formulaire de contact (§24). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Merci d'indiquer ton nom.").max(120),
  email: z.string().trim().email("Merci d'indiquer une adresse email valide.").max(160),
  subject: optionalText(160),
  message: z.string().trim().min(10, "Merci de détailler un peu ta demande.").max(3000),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Merci d'accepter le traitement de tes données pour continuer.",
    }),
  }),
  /** Champ piège anti-spam : doit rester vide. */
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Inscription pour recevoir l'ebook (§19, §20). */
export const ebookSchema = z.object({
  firstName: z.string().trim().min(2, "Merci d'indiquer ton prénom.").max(60),
  email: z.string().trim().email("Merci d'indiquer une adresse email valide.").max(160),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Merci d'accepter de recevoir l'ebook par email.",
    }),
  }),
  website: z.string().max(0).optional(),
  attribution: z.record(z.string()).optional(),
});

export type EbookInput = z.infer<typeof ebookSchema>;

/** Création d'une session de paiement (§12). */
export const checkoutSchema = z.object({
  offerSlug: z.string().min(1).max(60),
  email: z.string().trim().email().max(160),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** Traduit une erreur Zod en dictionnaire `champ → message`. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
