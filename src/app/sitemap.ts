import type { MetadataRoute } from "next";
import { brand, legalPages, offers, programs } from "@/content/site.config";

/** Sitemap XML (§35). Les pages du tunnel de réservation en sont exclues. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => new URL(path, brand.url).toString();

  return [
    { url: url("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: url("/accompagnements"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/reserver"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: url("/ebook"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    ...[...offers, ...programs].map((item) => ({
      url: url(`/accompagnements/${item.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...legalPages.map((page) => ({
      url: url(page.href),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
