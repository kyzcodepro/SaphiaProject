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
 * Numéro de téléphone (§15).
 *
 * L'objectif est d'écarter les saisies manifestement fausses — chiffres tapés
 * au hasard, numéro tronqué — sans refuser les numéros étrangers : le
 * questionnaire s'adresse aussi aux personnes hors de France.
 *
 * Deux écritures sont acceptées : le format national à dix chiffres
 * (`06 12 34 56 78`) et le format international (`+33 6 12 34 56 78`,
 * `0033…`). Espaces, points, tirets et parenthèses sont tolérés puis retirés.
 */
const PHONE_SEPARATORS = /[\s.\-()\u00a0\u202f]/g;
const NATIONAL_PHONE = /^0[1-9]\d{8}$/;
const INTERNATIONAL_PHONE = /^\+[1-9]\d{7,14}$/;

/**
 * Renvoie le numéro nettoyé, ou `null` s'il ne peut pas être un vrai numéro.
 *
 * Le test des chiffres distincts écarte les suites factices du type
 * `0999999999` ou `0101010101`, qui passent pourtant le contrôle de forme.
 */
export function normalizePhone(value: string): string | null {
  let compact = value.replace(PHONE_SEPARATORS, "");
  if (compact.startsWith("00")) compact = `+${compact.slice(2)}`;

  const national = NATIONAL_PHONE.test(compact);
  if (!national && !INTERNATIONAL_PHONE.test(compact)) return null;

  const digits = compact.replace("+", "");
  if (new Set(digits).size < 3) return null;

  return national ? compact.replace(/(\d{2})(?=\d)/g, "$1 ") : compact;
}

const optionalPhone = z
  .string()
  .trim()
  .max(24, "Ce numéro est trop long.")
  .refine((value) => value === "" || normalizePhone(value) !== null, {
    message: "Ce numéro ne semble pas valide. Exemple : 06 12 34 56 78.",
  })
  .transform((value) => (value === "" ? undefined : (normalizePhone(value) ?? undefined)))
  .optional();

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
  phone: optionalPhone,
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
