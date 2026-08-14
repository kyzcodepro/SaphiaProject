import type { MetadataRoute } from "next";
import { brand } from "@/content/site.config";

export default function robots(): MetadataRoute.Robots {
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
