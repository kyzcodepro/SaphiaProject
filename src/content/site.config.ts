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
 *  TON ÉDITORIAL — les textes reprennent la voix de l'ebook « Reprendre le
 *  contrôle de ta vie émotionnelle » : tutoiement, adresse au féminin, phrases
 *  courtes, recadrages en deux temps (« ce n'est pas X, c'est Y »), aucun
 *  jargon. Voir docs/VOIX-DE-MARQUE.md avant d'écrire un nouveau texte.
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
  /** Situations concernées. */
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
  /** Prix affiché. `null` => « Tarif défini lors de l'appel découverte ». */
  priceLabel: string | null;
  benefits: string[];
};

/* ───────────────────────────── Marque & contacts ─────────────────────────── */

/**
 * Adresse publique du site.
 *
 * Tolère les saisies approximatives faites dans un tableau de bord d'hébergeur :
 * variable créée mais laissée vide, protocole oublié, slash final, espaces.
 * Une valeur inutilisable retombe sur l'adresse par défaut plutôt que de faire
 * échouer la mise en ligne.
 */
function resolveSiteUrl(): string {
  const fallback = "https://originallife.fr";
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return fallback;

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate).origin;
  } catch {
    return fallback;
  }
}


export const brand = {
  name: "Saphia",
  /** À COMPLÉTER — dénomination légale exacte de l'activité. */
  legalName: "Saphia Accompagnement",
  tagline: "Accompagnement individuel pour reprendre le contrôle de ta vie émotionnelle",
  /** Utilisé pour les URLs absolues, le sitemap et les balises Open Graph. */
  url: resolveSiteUrl(),
  /** À COMPLÉTER — adresse email professionnelle réelle. */
  email: "contact@originallife.fr",
  /** Format international sans « + » ni espaces, comme l'attend wa.me. */
  whatsapp: "33652072263",
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
   * Exemple : https://calendly.com/saphia-arabi → "saphia-arabi"
   *
   * La variable d'environnement permet de pointer un autre compte — un compte
   * de test, par exemple — sans modifier ce fichier.
   */
  username: process.env.NEXT_PUBLIC_CALENDLY_USERNAME?.trim() || "saphia-arabi",
  /** Couleurs du widget, alignées sur la charte du site. */
  widget: {
    backgroundColor: "ffffff",
    primaryColor: "5b3a4a",
    textColor: "241e1b",
  },
} as const;

/**
 * Où se règlent les séances.
 *
 *  "calendly" — Calendly encaisse au moment où le créneau est choisi. Le
 *               rendez-vous n'existe pas tant que le paiement n'est pas passé,
 *               et le site n'a aucun encaissement à vérifier.
 *  "site"     — le site encaisse d'abord, vérifie le paiement côté serveur,
 *               puis ouvre le calendrier.
 *
 * L'ebook n'est pas concerné : Calendly ne vend que des rendez-vous, sa vente
 * reste assurée par le site quelle que soit la valeur choisie ici.
 */
export const sessionPayment: "calendly" | "site" = "calendly";

/* ──────────────────────── Règles de réservation (§14) ────────────────────── */
/* Ces règles sont appliquées par Calendly. Elles sont déclarées ici pour être
   affichées sur le site et rester cohérentes avec la configuration Calendly. */

export const bookingRules = {
  minimumNoticeHours: 4,
  bufferMinutes: 15,
  /** Jours ouvrés affichés (§13). À AJUSTER selon les horaires réels. */
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
  /** Avance du premier rappel automatique envoyé par Calendly (§17). */
  reminderHours: 24,
} as const;

/* ──────────────────────────── Offres (§5, §9) ────────────────────────────── */

export const offers: Offer[] = [
  {
    slug: "appel-decouverte",
    name: "Appel découverte",
    tagline: "On fait le point, sans engagement",
    durationMinutes: 30,
    price: 0,
    calendlyEvent: "appel-decouverte",
    shortDescription:
      "30 minutes offertes pour poser des mots sur ce que tu traverses et voir ensemble ce dont tu as besoin.",
    description:
      "Un premier échange, simplement. Tu me racontes où tu en es, ce qui pèse, ce que tu n'arrives plus à porter seule. Je t'écoute sans te juger et je te dis honnêtement si — et comment — je peux t'aider. Tu n'as rien à préparer, rien à prouver, rien à décider ensuite.",
    problems: [
      "Tu ne sais pas par où commencer",
      "Tu veux savoir si le courant passe avant de t'engager",
      "Tu n'arrives pas encore à mettre des mots dessus",
    ],
    benefits: [
      "Poser des mots sur ce que tu ressens",
      "Comprendre ce qui se joue vraiment",
      "Repartir avec une première piste concrète",
      "Savoir si l'accompagnement est fait pour toi",
    ],
    steps: [
      "Tu remplis un court questionnaire — uniquement ce que tu veux bien partager",
      "Tu choisis ton créneau dans mon agenda",
      "On échange 30 minutes, par téléphone ou en visio",
      "Je te propose la suite la plus adaptée, sans pression",
    ],
    terms: [
      "Entièrement gratuit, aucun paiement demandé",
      "Par appel WhatsApp ou en visioconférence, au choix",
      `Réservation au minimum ${bookingRules.minimumNoticeHours} h à l'avance`,
      `Annulable ou déplaçable jusqu'à ${bookingRules.cancellationNoticeHours} h avant`,
      "Strictement confidentiel",
    ],
    featured: true,
  },
  {
    slug: "seance-individuelle",
    name: "Séance individuelle",
    tagline: "Y voir clair sur une situation",
    durationMinutes: 60,
    price: 50,
    calendlyEvent: "seance-individuelle",
    shortDescription:
      "Une heure pour comprendre ce qui se joue dans une situation précise et savoir quoi en faire.",
    description:
      "Une relation qui te fait douter. Une décision que tu repousses. Une émotion qui revient sans que tu saches pourquoi. On prend une heure pour regarder la situation en face, ensemble. Pas pour la juger : pour comprendre ce qu'elle essaie de te dire, et pour que tu repartes avec quelque chose de concret à poser.",
    problems: [
      "Une relation qui te fait douter en permanence",
      "Une décision que tu n'arrives pas à prendre",
      "Une émotion qui revient et qui te submerge",
      "Une limite que tu n'arrives pas à poser",
    ],
    benefits: [
      "Comprendre ce qui se joue derrière la situation",
      "Nommer ce que tu ressens, sans le minimiser",
      "Repartir avec une action précise, à ta portée",
      "Un retour écrit par email après la séance",
    ],
    steps: [
      "Tu remplis le questionnaire préalable",
      "Tu choisis ton créneau et tu règles la séance en ligne",
      "Tu reçois la confirmation et le lien de connexion par email",
      "On échange une heure, par téléphone ou en visio",
    ],
    terms: [
      "Le rendez-vous n'est confirmé qu'une fois la séance réglée",
      "Par appel WhatsApp ou en visioconférence, au choix",
      `Réservation au minimum ${bookingRules.minimumNoticeHours} h à l'avance`,
      `Report possible jusqu'à ${bookingRules.cancellationNoticeHours} h avant la séance`,
      "Strictement confidentiel",
    ],
    featured: true,
  },
  {
    slug: "seance-approfondie",
    name: "Séance approfondie",
    tagline: "Reprendre le fil, en profondeur",
    durationMinutes: 120,
    price: 100,
    calendlyEvent: "seance-approfondie",
    shortDescription:
      "Deux heures pour relier les fils : ce qui se répète, ce qui s'est installé, et par où recommencer.",
    description:
      "Quand ce n'est pas une situation isolée mais un schéma qui revient — les mêmes relations, les mêmes doutes, le même épuisement — une heure ne suffit pas. On prend deux heures pour remonter le fil : ce qui se répète, depuis quand, et ce que ça protège chez toi. Tu repars avec un plan clair pour les semaines à venir.",
    problems: [
      "Les mêmes schémas qui se répètent dans tes relations",
      "Une rupture ou une séparation à traverser",
      "Un épuisement qui dure depuis des mois",
      "Le sentiment d'avoir perdu qui tu es",
    ],
    benefits: [
      "Voir clairement ce qui se répète, et pourquoi",
      "Comprendre ce que ces schémas protègent chez toi",
      "Un plan concret, étape par étape",
      "Un retour écrit détaillé après la séance",
    ],
    steps: [
      "Tu remplis le questionnaire préalable",
      "Tu choisis ton créneau et tu règles la séance en ligne",
      "Tu reçois la confirmation et le lien de connexion par email",
      "On échange deux heures, avec une pause au milieu",
    ],
    terms: [
      "Le rendez-vous n'est confirmé qu'une fois la séance réglée",
      "Par appel WhatsApp ou en visioconférence, au choix",
      `Réservation au minimum ${bookingRules.minimumNoticeHours} h à l'avance`,
      `Report possible jusqu'à ${bookingRules.cancellationNoticeHours} h avant la séance`,
      "Strictement confidentiel",
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
    tagline: "Se détacher et se reconstruire",
    description:
      "Six mois pour traverser les quatre étapes : prendre conscience, prendre de la distance, te reconstruire, installer de nouvelles habitudes. Des séances régulières, et un fil entre les séances pour ne pas rester seule quand ça remonte.",
    includes: [
      "Des séances régulières tout au long du programme",
      "Un point d'étape à chaque séance",
      "Un suivi entre les séances par WhatsApp",
      "Des exercices adaptés à ta situation",
    ],
    priceLabel: null,
    benefits: [
      "Un cadre qui tient quand la motivation retombe",
      "Quelqu'un à qui parler dans les moments difficiles",
      "Des changements qui s'installent, au lieu de retomber",
    ],
  },
  {
    slug: "accompagnement-12-mois",
    name: "Accompagnement 12 mois",
    duration: "12 mois",
    tagline: "Te retrouver, durablement",
    description:
      "Une année entière, pour les situations qui demandent du temps : une séparation, un schéma installé depuis longtemps, une reconstruction complète. On avance à ton rythme, sans étape sautée.",
    includes: [
      "Un accompagnement construit sur douze mois",
      "Des séances régulières et un suivi continu",
      "Un accompagnement WhatsApp entre les séances",
      "Des ressources et exercices personnalisés",
    ],
    priceLabel: null,
    benefits: [
      "Le temps nécessaire pour que ça tienne",
      "Un soutien présent dans les moments clés",
      "Un regard sur le chemin parcouru, régulièrement",
    ],
  },
];

/* ─────────────────────────── Contenus éditoriaux ─────────────────────────── */

export const hero = {
  title: "Tu donnes beaucoup, tu ressens tout, et tu finis par t'oublier.",
  subtitle:
    "Je t'accompagne pour comprendre ce qui se joue en toi, poser tes limites et te reconstruire — par téléphone, à ton rythme, sans jugement.",
  primaryCta: { label: "Réserver mon appel découverte", href: "/reserver/appel-decouverte" },
  secondaryCta: { label: "Découvrir les accompagnements", href: "/accompagnements" },
  /**
   * Photo d'accueil. Déposer le fichier dans `public/images/` sous ce nom
   * exact pour le remplacer — aucune autre modification n'est nécessaire.
   * Cadrage portrait (4:5), 1200 × 1500 px suffisent.
   */
  image: "/images/portrait.jpg",
  imageAlt: "Portrait de Saphia, accompagnante",
};

/* Bio adaptée de la page « Qui suis-je » de l'ebook. À faire relire par Saphia
   avant mise en ligne, notamment la mention de sa qualification. */
export const about = {
  title: "Bonjour, moi c'est Saphia",
  paragraphs: [
    "Ce que je partage avec les personnes que j'accompagne, je l'ai d'abord vécu moi-même : le mal-être qu'on n'arrive pas à nommer, l'oubli de soi pour les autres, et le long chemin pour se reconstruire.",
    "Mon parcours personnel, associé à mon expérience professionnelle d'aide médico-psychologique, m'a donné les compétences et la sensibilité nécessaires pour accompagner des personnes en souffrance, avec justesse et sans jugement.",
    "Je sais à quel point il est difficile de mettre des mots sur ce que l'on ressent. Et à quel point être accompagnée, vraiment, peut tout changer. C'est cette conviction qui m'a poussée à créer cet accompagnement individuel.",
  ],
  values: [
    { title: "Sans jugement", text: "Un espace où tu peux tout dire, vraiment tout." },
    { title: "Confidentiel", text: "Ce qui se dit pendant nos échanges reste entre nous." },
    { title: "À ton rythme", text: "Aucune étape sautée, aucune pression à aller plus vite." },
  ],
};

export const problems = {
  title: "Tu te reconnais dans l'une de ces situations ?",
  subtitle:
    "Ce sont les mots qui reviennent le plus souvent dans mes accompagnements. Si l'un d'eux te parle, on peut en parler.",
  items: [
    {
      title: "Tu te sens mal sans savoir pourquoi",
      text: "Rien de grave sur le papier, et pourtant ça ne va pas.",
    },
    {
      title: "Tu t'oublies pour les autres",
      text: "Tu fais passer leurs besoins avant les tiens, tout le temps.",
    },
    {
      title: "Tu cours après quelqu'un",
      text: "Plus la personne s'éloigne, plus tu fais d'efforts.",
    },
    {
      title: "Tu pardonnes tout",
      text: "Même quand ça te blesse. Même quand ça recommence.",
    },
    {
      title: "Tu doutes en permanence",
      text: "Tu anticipes ses réactions avant même de parler.",
    },
    {
      title: "Tu n'arrives pas à dire non",
      text: "Et quand tu y arrives, tu culpabilises pendant des heures.",
    },
    {
      title: "Tu te trouves « trop »",
      text: "Trop sensible, trop gentille, trop attachée.",
    },
    {
      title: "Tu voudrais partir",
      text: "Tu sais que ce n'est pas bon pour toi. Tu restes quand même.",
    },
  ],
};

/* La méthode reprend les quatre étapes du chapitre 07 de l'ebook. */
export const method = {
  title: "Comment on avance ensemble",
  subtitle: "S'en sortir, ce n'est pas un déclic. C'est un processus, en quatre temps.",
  steps: [
    {
      number: "01",
      title: "Prise de conscience",
      text: "Arrêter de minimiser. Nommer les choses telles qu'elles sont.",
    },
    {
      number: "02",
      title: "Prendre de la distance",
      text: "Observer. Moins donner. Laisser de l'espace entre ce que tu ressens et ce que tu fais.",
    },
    {
      number: "03",
      title: "Te reconstruire",
      text: "Revenir à toi. Réinvestir ce que tu avais mis de côté.",
    },
    {
      number: "04",
      title: "Nouvelles habitudes",
      text: "Ne plus accepter l'inacceptable. Ne plus courir après. Te choisir.",
    },
  ],
};

/**
 * ⚠️ TÉMOIGNAGES DE DÉMONSTRATION — À REMPLACER IMPÉRATIVEMENT
 *
 * Ces trois témoignages sont des exemples de mise en page. Publier de faux avis
 * est une pratique commerciale trompeuse (art. L.121-2 du Code de la
 * consommation). Remplacer par de vrais retours, avec l'accord écrit des
 * personnes concernées, ou vider ce tableau : la section disparaît alors du site.
 */
export const testimonials = [
  {
    quote:
      "Je pensais que j'étais juste « trop sensible ». En une séance, j'ai compris que je m'oubliais depuis des années.",
    author: "Exemple — à remplacer",
    context: "Séance individuelle",
  },
  {
    quote:
      "Saphia ne juge jamais. C'est la première fois que je peux tout dire sans avoir peur de la réaction en face.",
    author: "Exemple — à remplacer",
    context: "Accompagnement 6 mois",
  },
  {
    quote:
      "J'ai enfin réussi à dire non. Ça paraît petit. Pour moi, ça a tout changé.",
    author: "Exemple — à remplacer",
    context: "Séance approfondie",
  },
];

/* ────────────────────────────── Ebook (§19) ──────────────────────────────── */

export const EBOOK_SLUG = "ebook";

export type Ebook = {
  title: string;
  subtitle: string;
  description: string;
  /** Prix en euros. 0 = distribué gratuitement contre un email. */
  price: number;
  cover: string;
  pageCount: number;
  chapters: string[];
  bonuses: string[];
  benefits: string[];
  audience: string[];
  quote: string;
  fileName: string;
};

export const ebook: Ebook = {
  title: "Reprendre le contrôle de ta vie émotionnelle",
  subtitle: "Comprendre, se détacher et se reconstruire",
  description:
    "Un guide pour toi qui donnes beaucoup, qui ressens tout intensément, et qui te demandes parfois pourquoi tu te sens mal sans trouver d'explication claire. Ce n'est pas un traité théorique : c'est un accompagnement simple et direct, à lire et surtout à vivre.",
  /** Prix en euros. Mettre 0 pour le distribuer gratuitement contre un email. */
  price: 9.9,
  cover: "/images/ebook-cover.svg",
  pageCount: 18,
  chapters: [
    "Pourquoi tu te sens mal sans comprendre pourquoi",
    "Le vrai problème (et pourquoi tu restes bloquée)",
    "Ce que tu dois arrêter dès maintenant",
    "Reprendre le contrôle de tes émotions",
    "Reprendre confiance en toi",
    "Relations saines vs relations toxiques",
    "Le plan pour t'en sortir",
  ],
  bonuses: [
    "Un plan d'action en 7 jours, une action simple par jour",
    "Une checklist à garder sous les yeux",
    "Des questions à te poser à la fin de chaque chapitre",
  ],
  benefits: [
    "Comprendre ce qui se joue en toi, sans jargon",
    "Savoir quoi faire de ce que tu ressens",
    "Poser des limites sans devenir dure",
    "Reconnaître une relation qui te fait douter",
  ],
  audience: [
    "Tu donnes beaucoup et tu reçois rarement autant",
    "Tu te sens mal sans arriver à l'expliquer",
    "Tu veux commencer seule, à ton rythme",
    "Tu cherches du concret, pas de la théorie",
  ],
  quote: "Tu n'as pas besoin d'être parfaite. Tu as juste besoin de commencer.",
  /**
   * Nom du fichier livré après paiement.
   * Le PDF n'est PAS servi depuis /public : il est lu depuis le dossier
   * `private/` par la route protégée /api/ebook/download, qui revérifie le
   * paiement avant de l'envoyer. Voir docs/EBOOK.md.
   */
  fileName: "reprendre-le-controle-de-ta-vie-emotionnelle.pdf",
};

/* ──────────────────────────────── FAQ ────────────────────────────────────── */

export const faq = [
  {
    question: "L'appel découverte est-il vraiment gratuit ?",
    answer:
      "Oui, totalement. Aucun paiement n'est demandé et tu n'as aucune obligation de continuer ensuite. C'est 30 minutes pour poser des mots sur ce que tu traverses et voir si mon accompagnement correspond à ton besoin.",
  },
  {
    question: "Es-tu psychologue ou thérapeute ?",
    answer:
      "Non. Je suis aide médico-psychologique de formation, et j'accompagne aujourd'hui en tant qu'accompagnante individuelle. Mon travail relève du soutien et du développement personnel : il ne constitue ni un acte médical, ni une psychothérapie, et ne remplace pas un suivi par un professionnel de santé. Si tu traverses une souffrance importante, je t'orienterai vers la personne la plus adaptée — et je te le dirai franchement.",
  },
  {
    question: "Comment se déroulent les séances ?",
    answer:
      "Par appel WhatsApp ou en visioconférence, comme tu préfères — tu choisis au moment de la réservation. Beaucoup de personnes préfèrent le téléphone : on se sent souvent plus libre de parler sans être vue.",
  },
  {
    question: "Est-ce que c'est confidentiel ?",
    answer:
      "Oui. Ce qui se dit pendant nos échanges reste entre nous. Les séances ne sont jamais enregistrées, et les informations que tu partages ne sont utilisées que pour préparer et suivre ton accompagnement.",
  },
  {
    question: "Quand dois-je payer ?",
    answer:
      "Pour les séances payantes, le règlement se fait en ligne avant de choisir ton créneau, par carte bancaire ou via PayPal. Tant que le paiement n'est pas validé, la réservation n'est pas confirmée.",
  },
  {
    question: "Puis-je annuler ou déplacer un rendez-vous ?",
    answer:
      `Oui, jusqu'à ${bookingRules.cancellationNoticeHours} heures avant la séance, directement depuis les liens présents dans ton email de confirmation. Passé ce délai, la séance est due — les conditions détaillées figurent dans les CGV. En cas d'imprévu grave, écris-moi : on trouve une solution.`,
  },
  {
    question: "Dois-je répondre à toutes les questions du formulaire ?",
    answer:
      "Non. Seuls ton prénom, ton nom et ton email sont nécessaires pour organiser le rendez-vous. Tout le reste est facultatif : tu partages uniquement ce que tu as envie de partager, et tu peux garder le reste pour notre échange.",
  },
  {
    question: "L'ebook est-il inclus dans l'accompagnement ?",
    answer:
      "L'ebook se vend séparément. C'est un bon point de départ si tu veux commencer seule, mais il n'est pas nécessaire pour être accompagnée — et si tu l'as déjà lu, on part simplement de plus loin ensemble.",
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

/** Tout ce qui peut être payé sur le site : les séances et l'ebook. */
export type Purchasable = {
  slug: string;
  name: string;
  description: string;
  price: number;
  /** `true` pour un bien numérique livré immédiatement (impact sur les CGV). */
  digital: boolean;
};

export function getPurchasable(slug: string): Purchasable | undefined {
  if (slug === EBOOK_SLUG) {
    return {
      slug: EBOOK_SLUG,
      name: `Ebook — ${ebook.title}`,
      description: ebook.subtitle,
      price: ebook.price,
      digital: true,
    };
  }

  const offer = getOffer(slug);
  if (!offer) return undefined;

  return {
    slug: offer.slug,
    name: offer.name,
    description: offer.shortDescription,
    price: offer.price,
    digital: false,
  };
}

/** Page vers laquelle le client revient après un paiement. */
export function checkoutReturnPath(slug: string): string {
  return slug === EBOOK_SLUG ? "/ebook" : `/reserver/${slug}`;
}

export function formatPrice(price: number): string {
  return price === 0
    ? "Gratuit"
    : new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
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
