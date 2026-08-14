import type { Metadata } from "next";
import { brand, ebook, faq, offers, programs } from "@/content/site.config";

/** Construit les métadonnées d'une page (§35). */
export function pageMetadata(params: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  images?: string[];
}): Metadata {
  const url = new URL(params.path, brand.url).toString();
  return {
    title: params.title,
    description: params.description,
    alternates: { canonical: url },
    robots: params.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: brand.name,
      title: params.title,
      description: params.description,
      url,
      images: params.images,
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: params.images,
    },
  };
}

function absolute(path: string): string {
  return new URL(path, brand.url).toString();
}

/** Données structurées de l'organisation, injectées sur toutes les pages. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${brand.url}#organisation`,
    name: brand.name,
    legalName: brand.legalName,
    description: brand.tagline,
    url: brand.url,
    email: brand.email,
    telephone: `+${brand.whatsapp}`,
    image: absolute("/images/portrait.svg"),
    areaServed: "FR",
    availableLanguage: ["fr"],
    priceRange: "€€",
    sameAs: [brand.socials.tiktok, brand.socials.instagram, brand.socials.linktree],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "16:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Accompagnements",
      itemListElement: [
        ...offers.map((offer) => ({
          "@type": "Offer",
          name: offer.name,
          description: offer.shortDescription,
          price: offer.price.toFixed(2),
          priceCurrency: "EUR",
          url: absolute(`/accompagnements/${offer.slug}`),
        })),
        ...programs.map((program) => ({
          "@type": "Offer",
          name: program.name,
          description: program.tagline,
          url: absolute(`/accompagnements/${program.slug}`),
        })),
      ],
    },
  };
}

/** Données structurées d'une prestation. */
export function serviceJsonLd(offer: {
  slug: string;
  name: string;
  shortDescription: string;
  price: number;
  durationMinutes: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: offer.name,
    description: offer.shortDescription,
    serviceType: "Accompagnement en développement personnel",
    provider: { "@id": `${brand.url}#organisation` },
    areaServed: "FR",
    url: absolute(`/accompagnements/${offer.slug}`),
    offers: {
      "@type": "Offer",
      price: offer.price.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: absolute(`/reserver/${offer.slug}`),
    },
  };
}

/** Données structurées de la FAQ (page d'accueil). */
export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Données structurées de l'ebook. */
export function ebookJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: ebook.title,
    alternativeHeadline: ebook.subtitle,
    description: ebook.description,
    bookFormat: "https://schema.org/EBook",
    inLanguage: "fr",
    author: { "@type": "Person", name: brand.name },
    url: absolute("/ebook"),
    offers: {
      "@type": "Offer",
      price: ebook.price.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: absolute("/ebook"),
    },
  };
}

/** Fil d'Ariane, pour l'affichage des résultats Google. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}
