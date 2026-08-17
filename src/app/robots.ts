import type { MetadataRoute } from "next";
import { brand } from "@/content/site.config";
import { isIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Préversion : on interdit l'exploration entière plutôt que de risquer de
  // référencer des textes provisoires et des mentions légales incomplètes.
  if (!isIndexable()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Pages de tunnel : sans intérêt pour le référencement et susceptibles
        // de contenir des paramètres de paiement.
        disallow: ["/api/", "/reserver/", "/reservation-confirmee"],
      },
    ],
    sitemap: new URL("/sitemap.xml", brand.url).toString(),
  };
}
