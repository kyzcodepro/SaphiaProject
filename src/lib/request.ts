import { brand } from "@/content/site.config";

/**
 * Détermine l'origine du site pour construire les URLs de retour de paiement.
 *
 * Priorité : NEXT_PUBLIC_SITE_URL (valeur maîtrisée) → URL de la requête.
 * L'en-tête `Host` n'est jamais utilisé seul afin d'éviter une redirection
 * détournée vers un domaine tiers.
 */
export function siteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL ?? brand.url;
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // Configuration invalide : on retombe sur l'origine de la requête.
    }
  }
  return new URL(request.url).origin;
}
