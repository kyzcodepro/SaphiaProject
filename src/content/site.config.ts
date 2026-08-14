/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CONFIGURATION DU SITE
 * ─────────────────────────────────────────────────────────────────────────────
 *  Ce fichier centralise TOUT le contenu modifiable du site :
 *  offres, tarifs, textes, témoignages, ebook, liens sociaux, horaires affichés.
 *
 *  👉 Pour modifier le site au quotidien, il suffit d'éditer ce fichier.
 *     Aucune autre partie du code n'a besoin d'être touchée.
 *
 *  ⚠️  Les DISPONIBILITÉS RÉELLES (créneaux proposés, congés, plages bloquées)
 *      se gèrent directement dans Calendly — voir docs/ADMINISTRATION.md.
 *      Les horaires ci-dessous sont uniquement l'affichage indicatif du site.
 *
 *  Les valeurs marquées « À DÉFINIR » correspondent au §45 du PRD et doivent
 *  être complétées avant la mise en production.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Offer = {
  /** Identifiant utilisé dans l'URL : /reserver/appel-decouverte */
  slug: string;
  name: string;
  tagline: string;
  durationMinutes: number;
  /** Prix en euros. 0 = gratuit. */
  price: number;
  /** Slug de l'événement Calendly (partie après /votre-compte/). */
  calendlyEvent: string;
  shortDescription: string;
  description: string;
  /** Problématiques concernées (§8 du PRD). */
  problems: string[];
  benefits: string[];
  /** Déroulement de la séance. */
  steps: string[];
  /** Modalités pratiques. */
  terms: string[];
  featured?: boolean;
};

export type Program = {
  slug: string;
  name: string;
  duration: string;
  tagline: string;
  description: string;
  includes: string[];
  /** Prix affiché. `null` => « Sur devis, défini pendant l'appel découverte ». */
  priceLabel: string | null;
  benefits: string[];
};

/* ───────────────────────────── Marque & contacts ─────────────────────────── */

export const brand = {
  /** À DÉFINIR (§45) — nom commercial définitif. */
  name: "Saphia",
  legalName: "Saphia Accompagnement",
  tagline: "Accompagnement mindset & développement personnel",
  /** Utilisé pour les URLs absolues, le sitemap et les balises Open Graph. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.saphia.fr",
  email: "contact@saphia.fr",
  /** Format international sans espaces, utilisé pour les liens wa.me. */
  whatsapp: "33600000000",
  whatsappMessage:
    "Bonjour Saphia, je viens de votre site et j'aimerais des informations sur votre accompagnement.",
  socials: {
    tiktok: "https://www.tiktok.com/@saphia",
    instagram: "https://www.instagram.com/saphia",
    linktree: "https://linktr.ee/saphia",
  },
} as const;

/* ─────────────────────────────── Calendly ────────────────────────────────── */

export const calendly = {
  /**
   * Identifiant du compte Calendly : la partie après calendly.com/
   * Exemple : https://calendly.com/saphia → "saphia"
   */
  username: process.env.NEXT_PUBLIC_CALENDLY_USERNAME ?? "saphia",
  /** Couleurs du widget, alignées sur la charte du site. */
  widget: {
    backgroundColor: "ffffff",
    primaryColor: "5b3a4a",
    textColor: "241e1b",
  },
} as const;

/* ──────────────────────── Règles de réservation (§14) ────────────────────── */
/* Ces règles sont appliquées par Calendly. Elles sont déclarées ici pour être
   affichées sur le site et rester cohérentes avec la configuration Calendly. */

export const bookingRules = {
  minimumNoticeHours: 24,
  bufferMinutes: 15,
  /** Jours ouvrés affichés (§13). */
  openingHours: [
    { day: "Lundi", hours: "09h00 – 18h00" },
    { day: "Mardi", hours: "09h00 – 18h00" },
    { day: "Mercredi", hours: "09h00 – 18h00" },
    { day: "Jeudi", hours: "09h00 – 18h00" },
    { day: "Vendredi", hours: "09h00 – 18h00" },
    { day: "Samedi", hours: "10h00 – 16h00" },
    { day: "Dimanche", hours: "Fermé" },
  ],
  /** Délai au-delà duquel une séance ne peut plus être annulée/déplacée (§18). */
  cancellationNoticeHours: 24,
} as const;

/* ──────────────────────────── Offres (§5, §9) ────────────────────────────── */

export const offers: Offer[] = [
  {
    slug: "appel-decouverte",
    name: "Appel découverte",
    tagline: "Faisons connaissance",
    durationMinutes: 30,
    price: 0,
    calendlyEvent: "appel-decouverte",
    shortDescription:
      "30 minutes offertes pour faire le point sur ta situation et déterminer l'accompagnement le plus adapté.",
    description:
      "Un premier échange sans engagement, pensé pour comprendre où tu en es aujourd'hui. On parle de ta situation, de ce qui te bloque et de ce que tu aimerais changer. À la fin de l'appel, tu repars avec une vision claire de la suite — que tu décides de continuer avec moi ou non.",
    problems: [
      "Tu hésites entre plusieurs accompagnements",
      "Tu ne sais pas par où commencer",
      "Tu veux savoir si le courant passe avant de t'engager",
    ],
    benefits: [
      "Comprendre ta situation actuelle",
      "Identifier tes attentes et tes priorités",
      "Découvrir ma méthode d'accompagnement",
      "Repartir avec l'offre la plus adaptée à ton besoin",
    ],
    steps: [
      "Tu remplis un court questionnaire pour que je prépare notre échange",
      "Tu choisis ton créneau dans mon agenda",
      "On échange 30 minutes en visio ou par WhatsApp",
      "Je te propose la suite la plus adaptée, sans pression",
    ],
    terms: [
      "Entièrement gratuit, aucun paiement demandé",
      "En visioconférence (Zoom) ou par WhatsApp, au choix",
      "Réservation au minimum 24 h à l'avance",
      "Annulable ou déplaçable jusqu'à 24 h avant",
    ],
    featured: true,
  },
  {
    slug: "seance-individuelle",
    name: "Séance individuelle",
    tagline: "Débloquer une situation précise",
    durationMinutes: 60,
    price: 50,
    calendlyEvent: "seance-individuelle",
    shortDescription:
      "Une heure pour travailler un sujet précis et repartir avec un plan d'action concret.",
    description:
      "Une séance ciblée sur une problématique unique : une décision à prendre, une période de doute, un besoin de clarté. On analyse la situation ensemble, on identifie ce qui te freine réellement, et on construit un plan d'action que tu peux appliquer dès le lendemain.",
    problems: [
      "Une décision difficile à prendre",
      "Un manque de confiance ponctuel",
      "Une baisse de motivation",
      "Un besoin de prendre du recul",
    ],
    benefits: [
      "Y voir clair sur une situation précise",
      "Identifier le blocage réel derrière le symptôme",
      "Repartir avec des actions concrètes et réalisables",
      "Un suivi écrit par email après la séance",
    ],
    steps: [
      "Tu remplis le questionnaire préalable",
      "Tu règles la séance en ligne (carte bancaire ou PayPal)",
      "Tu choisis ton créneau dans mon agenda",
      "On travaille ensemble pendant 1 heure",
    ],
    terms: [
      "Paiement obligatoire avant la confirmation du rendez-vous",
      "En visioconférence (Zoom) ou par WhatsApp, au choix",
      "Réservation au minimum 24 h à l'avance",
      "Report possible jusqu'à 24 h avant la séance",
    ],
    featured: true,
  },
  {
    slug: "seance-approfondie",
    name: "Séance approfondie",
    tagline: "Aller au fond des choses",
    durationMinutes: 120,
    price: 100,
    calendlyEvent: "seance-approfondie",
    shortDescription:
      "Deux heures pour prendre de la hauteur sur plusieurs aspects de ta vie et construire une feuille de route.",
    description:
      "Le format le plus complet en séance unique. On prend le temps d'explorer plusieurs dimensions à la fois — personnelle, familiale, professionnelle — pour comprendre comment elles s'influencent. Tu repars avec une feuille de route structurée sur les semaines à venir.",
    problems: [
      "Un changement de vie important",
      "Plusieurs domaines bloqués en même temps",
      "Difficulté à concilier vie pro et vie familiale",
      "Un sentiment de blocage global",
    ],
    benefits: [
      "Une vision d'ensemble de ta situation",
      "Un travail en profondeur sur les causes",
      "Une feuille de route structurée",
      "Un suivi écrit détaillé après la séance",
    ],
    steps: [
      "Tu remplis le questionnaire préalable",
      "Tu règles la séance en ligne (carte bancaire ou PayPal)",
      "Tu choisis ton créneau dans mon agenda",
      "On travaille ensemble pendant 2 heures, avec une pause",
    ],
    terms: [
      "Paiement obligatoire avant la confirmation du rendez-vous",
      "En visioconférence (Zoom) ou par WhatsApp, au choix",
      "Réservation au minimum 24 h à l'avance",
      "Report possible jusqu'à 24 h avant la séance",
    ],
    featured: true,
  },
];

/* ────────────────── Accompagnements longue durée (§6) ────────────────────── */
/* À DÉFINIR (§45) : nombre de séances, fréquence, tarif, modalités de paiement.
   En attendant, ces formules sont présentées sans prix et orientent vers
   l'appel découverte. */

export const programs: Program[] = [
  {
    slug: "accompagnement-6-mois",
    name: "Accompagnement 6 mois",
    duration: "6 mois",
    tagline: "Installer un changement durable",
    description:
      "Un accompagnement personnalisé sur six mois, construit autour de tes objectifs. Des séances régulières pour avancer étape par étape, et un suivi entre les séances pour ne jamais rester bloquée seule.",
    includes: [
      "Des séances régulières tout au long du programme",
      "Un plan d'action revu à chaque étape",
      "Un suivi entre les séances par WhatsApp",
      "Des ressources et exercices personnalisés",
    ],
    priceLabel: null,
    benefits: [
      "Un cadre qui tient dans la durée",
      "Des ajustements au fil de ton évolution",
      "Une progression mesurable, mois après mois",
    ],
  },
  {
    slug: "accompagnement-12-mois",
    name: "Accompagnement 12 mois",
    duration: "12 mois",
    tagline: "Une transformation en profondeur",
    description:
      "Le programme le plus complet : une année entière pour transformer durablement ton rapport à toi-même, à ta famille et à ton travail. Le format adapté aux changements de vie importants.",
    includes: [
      "Un programme construit sur douze mois",
      "Des séances régulières et un suivi continu",
      "Un accompagnement WhatsApp entre les séances",
      "Des ressources, exercices et documents inclus",
    ],
    priceLabel: null,
    benefits: [
      "Le temps nécessaire pour ancrer les changements",
      "Un accompagnement présent dans les moments clés",
      "Un bilan régulier de ta progression",
    ],
  },
];

/* ─────────────────────────── Contenus éditoriaux ─────────────────────────── */

export const hero = {
  title: "Transforme ton mindset et avance avec un accompagnement adapté à ta situation.",
  subtitle:
    "J'accompagne les femmes et les hommes qui traversent une période de doute, de blocage ou de changement — pour retrouver de la clarté, de la confiance et une direction.",
  primaryCta: { label: "Réserver mon appel découverte", href: "/reserver/appel-decouverte" },
  secondaryCta: { label: "Découvrir les accompagnements", href: "/accompagnements" },
  /** À DÉFINIR (§45) : photo professionnelle. */
  image: "/images/portrait.svg",
  imageAlt: "Portrait de Saphia, accompagnatrice mindset",
};

export const about = {
  /** À DÉFINIR (§45) : biographie définitive. */
  title: "Bonjour, moi c'est Saphia",
  paragraphs: [
    "Je suis accompagnatrice en développement personnel et mindset. Mon rôle n'est pas de te dire quoi faire, mais de t'aider à voir clair dans ta situation et à retrouver ta capacité à décider.",
    "J'ai moi-même traversé des périodes de blocage, de doute et de remise en question. C'est ce parcours qui m'a amenée à me former et à accompagner aujourd'hui des personnes qui veulent changer quelque chose dans leur vie, sans savoir par où commencer.",
    "Ce qui compte pour moi : un accompagnement humain, sans jugement, concret. On part de là où tu en es, et on avance à ton rythme.",
  ],
  values: [
    { title: "Sans jugement", text: "Un espace où tu peux tout dire, en confiance." },
    { title: "Concret", text: "Des actions applicables, pas de théorie abstraite." },
    { title: "À ton rythme", text: "On avance selon ta situation, pas selon un programme figé." },
  ],
};

export const problems = {
  title: "Tu te reconnais dans l'une de ces situations ?",
  subtitle:
    "Ce sont les sujets qui reviennent le plus souvent dans mes accompagnements. Si l'un d'eux te parle, on peut en discuter.",
  items: [
    { title: "Manque de confiance", text: "Tu doutes de toi, de tes choix, de ta légitimité." },
    { title: "Perte de motivation", text: "Tu n'arrives plus à te mettre en mouvement." },
    { title: "Changement de vie", text: "Une nouvelle étape s'ouvre et tu ne sais pas comment l'aborder." },
    { title: "Difficultés familiales", text: "Les relations à la maison pèsent sur ton quotidien." },
    { title: "Difficultés professionnelles", text: "Ton travail ne te correspond plus, ou t'épuise." },
    { title: "Besoin d'organisation", text: "Tu te sens débordée et tu n'arrives plus à prioriser." },
    { title: "Sentiment de blocage", text: "Tu tournes en rond depuis des mois sans avancer." },
    { title: "Décision à prendre", text: "Un choix important t'attend et tu hésites." },
  ],
};

export const method = {
  title: "Comment se passe l'accompagnement",
  subtitle: "Une méthode simple, en quatre temps, quel que soit le format choisi.",
  steps: [
    { number: "01", title: "Échange", text: "On analyse ensemble ta situation actuelle, sans filtre." },
    { number: "02", title: "Objectifs", text: "On identifie précisément ce que tu veux changer." },
    { number: "03", title: "Plan d'action", text: "On définit des actions concrètes et réalisables." },
    { number: "04", title: "Accompagnement", text: "On ajuste au fil des séances jusqu'à l'objectif." },
  ],
};

/* À DÉFINIR (§45) : témoignages réels, avec accord écrit des personnes citées. */
export const testimonials = [
  {
    quote:
      "J'ai commencé par l'appel découverte sans trop y croire. Six mois plus tard, j'ai changé de poste et je me sens enfin à ma place.",
    author: "Marie",
    context: "Accompagnement 6 mois",
  },
  {
    quote:
      "En deux heures, Saphia m'a aidée à comprendre ce qui me bloquait vraiment. Je suis repartie avec un plan clair.",
    author: "Sonia",
    context: "Séance approfondie",
  },
  {
    quote:
      "Ce que j'apprécie, c'est qu'il n'y a aucun jugement. On peut tout dire, et ça change tout.",
    author: "Julien",
    context: "Séances individuelles",
  },
];

export const ebook = {
  /** À DÉFINIR (§45) : titre, couverture, prix et fichier définitifs. */
  title: "Reprendre le contrôle",
  subtitle: "Le guide pour sortir d'une période de blocage en 7 étapes",
  description:
    "Un guide pratique qui reprend les fondamentaux que j'utilise en accompagnement : comprendre ce qui te bloque réellement, sortir du mode automatique et remettre du mouvement dans ton quotidien.",
  /** Prix en euros. 0 = gratuit (téléchargement contre email). */
  price: 0,
  cover: "/images/ebook-cover.svg",
  chapters: [
    "Identifier le vrai blocage derrière le symptôme",
    "Sortir du pilote automatique",
    "Reprendre la main sur ton organisation",
    "Reconstruire ta confiance, étape par étape",
    "Poser des limites sans culpabiliser",
    "Décider, même dans l'incertitude",
    "Tenir dans la durée",
  ],
  benefits: [
    "Des exercices concrets à faire chez toi",
    "Des situations réelles rencontrées en accompagnement",
    "Un format court, lisible en une soirée",
  ],
  audience: [
    "Tu traverses une période de doute ou de blocage",
    "Tu veux commencer à avancer seule avant d'être accompagnée",
    "Tu cherches des outils concrets plutôt que de la théorie",
  ],
  /** Fichier servi après inscription. Placer le PDF dans /public/ebook/. */
  fileUrl: "/ebook/reprendre-le-controle.pdf",
};

export const faq = [
  {
    question: "L'appel découverte est-il vraiment gratuit ?",
    answer:
      "Oui, totalement. Aucun paiement n'est demandé et tu n'as aucune obligation de continuer ensuite. C'est un échange de 30 minutes pour faire le point et voir si mon accompagnement correspond à ton besoin.",
  },
  {
    question: "Comment se déroulent les séances ?",
    answer:
      "En visioconférence via Zoom, ou par appel WhatsApp — tu choisis au moment de la réservation. Le lien Zoom ou les instructions WhatsApp te sont envoyés automatiquement avec ta confirmation.",
  },
  {
    question: "Quand dois-je payer ?",
    answer:
      "Pour les séances payantes, le règlement se fait en ligne avant de choisir ton créneau, par carte bancaire (Stripe) ou via PayPal. Tant que le paiement n'est pas validé, la réservation n'est pas confirmée.",
  },
  {
    question: "Puis-je annuler ou déplacer un rendez-vous ?",
    answer:
      "Oui, jusqu'à 24 heures avant la séance, directement depuis le lien présent dans ton email de confirmation. Passé ce délai, la séance est due — les conditions détaillées figurent dans les CGV.",
  },
  {
    question: "À quel moment puis-je réserver ?",
    answer:
      "Les rendez-vous sont proposés du lundi au samedi, et doivent être réservés au minimum 24 heures à l'avance. Les créneaux réellement disponibles s'affichent automatiquement dans le calendrier.",
  },
  {
    question: "Es-tu psychologue ou thérapeute ?",
    answer:
      "Non. Mon accompagnement relève du développement personnel et du coaching de vie : il ne constitue ni un acte médical, ni une psychothérapie, et ne remplace pas un suivi par un professionnel de santé.",
  },
];

/* ────────────────────────── Navigation & pages légales ───────────────────── */

export const navigation = [
  { label: "Accueil", href: "/" },
  { label: "Accompagnements", href: "/accompagnements" },
  { label: "Réserver", href: "/reserver" },
  { label: "Ebook", href: "/ebook" },
  { label: "Contact", href: "/contact" },
];

export const legalPages = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
  { label: "Politique de cookies", href: "/politique-de-cookies" },
  { label: "CGV", href: "/cgv" },
  { label: "Annulation & remboursement", href: "/annulation-et-remboursement" },
];

/* ─────────────────────────────── Utilitaires ─────────────────────────────── */

export function getOffer(slug: string): Offer | undefined {
  return offers.find((offer) => offer.slug === slug);
}

export function getProgram(slug: string): Program | undefined {
  return programs.find((program) => program.slug === slug);
}

export function formatPrice(price: number): string {
  return price === 0
    ? "Gratuit"
    : new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      }).format(price);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = minutes / 60;
  return hours === 1 ? "1 heure" : `${hours} heures`;
}

export function whatsappLink(message: string = brand.whatsappMessage): string {
  return `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(message)}`;
}
