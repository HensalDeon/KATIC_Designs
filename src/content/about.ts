import type { ServiceIconName } from "@/components/icons/service-icon";
import type { ContactChannel, EnquiryFormConfig } from "@/components/sections/contact-faq";
import type { SectionCta } from "@/components/sections/section-header";
import type { SectionImage } from "@/components/sections/section-image";
import { type DivisionSlug, routes } from "@/lib/routes";

import type { TitleLine } from "./home/hero";
import type { ProjectSlug } from "./projects";
import type { RelatedServiceSlug } from "./related-services";

/**
 * About page (`#p-about`, original lines 2920–3113): every section's copy, verbatim from the
 * original. Shared entities (services, divisions, projects) are referenced by slug, never
 * restated (D6, KI-D01). Will come from Laravel (`GET /pages/about`) in Phase 11.
 *
 * Image alts describe the image instead of repeating headlines or slogans (KI-A13).
 */

/** A link button of an About section (`.btn`). */
export type AboutLink = { readonly label: string; readonly href: string };

export type AboutSeo = { readonly title: string; readonly description: string };

/** `data-title` / `data-desc` of `#p-about` (the title already ends in "| Katic Designs"). */
export const ABOUT_SEO = {
  title: "About Katic Designs | Architecture & Interior Design Studio, Kochi",
  description:
    "Founded in 2013 in Kochi, Katic Designs brings architects, interior designers and site teams together to design and build eco-conscious homes and buildings.",
} as const satisfies AboutSeo;

export type AboutHeroContent = {
  readonly image: SectionImage;
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly lead: string;
  readonly primaryCta: AboutLink;
  readonly secondaryCta: AboutLink;
  /** Decorative vertical labels at the bottom corners (`.vl`). */
  readonly labels: readonly [left: string, right: string];
};

export const ABOUT_HERO = {
  image: {
    src: "photos/design-studio-3d-model",
    alt: "Design workstation showing a 3D building model",
  },
  kicker: "Katic Designs · Kerala & UAE",
  title: ["Designing Spaces.", "Shaping", { accent: "Experiences." }],
  lead: "Katic Designs is an architecture, interior design and construction practice creating thoughtful spaces across Kerala and the UAE.",
  primaryCta: { label: "Explore Our Approach", href: `${routes.about}#about-approach` },
  secondaryCta: { label: "View Our Projects", href: `${routes.works}#works-list` },
  labels: ["ABOUT \\ 01", "OUR STORY ↓"],
} as const satisfies AboutHeroContent;

export type AboutIntroContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly lead: string;
  readonly body: string;
  readonly cta: AboutLink;
  /** Small landscape image (`.imr .a`) and the large one (`.imr .b`). */
  readonly images: readonly [small: SectionImage, large: SectionImage];
  /** The cream "studio" card (`.imr .s`). */
  readonly studio: { readonly label: string; readonly text: string; readonly places: string };
};

export const ABOUT_INTRO = {
  kicker: "Who we are",
  title: ["Architecture With", "Purpose"],
  lead: "We believe good design begins with understanding people, place and how a space will be experienced.",
  body: "KATIC brings architecture, interiors, construction, development and property care together in one practice. Our studio works closely with homeowners, developers and businesses from the first conversation to the final handover. By listening before drawing and coordinating every detail, we turn practical needs, local context and individual character into spaces made to last.",
  cta: { label: "Meet the Founder", href: `${routes.about}#about-founder` },
  images: [
    { src: "photos/granite-kitchen", alt: "Kitchen with granite worktops and white cabinets" },
    {
      src: "photos/arched-courtyard-terrace",
      alt: "Courtyard terrace with arches and patterned tiles",
    },
  ],
  studio: {
    label: "STUDIO",
    text: "One team. One vision. Every detail connected.",
    places: "Kochi · Kannur · Dubai",
  },
} as const satisfies AboutIntroContent;

export type AboutPhilosophyContent = {
  readonly kicker: string;
  readonly title: string;
  readonly image: SectionImage;
  /** Caption over the image (`.im span`). */
  readonly caption: string;
  readonly lead: string;
  readonly body: string;
  readonly tags: readonly string[];
  readonly cta: AboutLink;
};

export const ABOUT_PHILOSOPHY = {
  kicker: "Our Philosophy",
  title: "Designed Around You",
  image: { src: "photos/open-pavilion-lounge-night", alt: "Open timber pavilion lounge at night" },
  caption: "Light · Material · Proportion",
  lead: "Our design philosophy balances functionality, character, comfort, context and timeless design.",
  body: "Every plan is tested against daily life: how morning light enters, how people move, where conversation happens, and what will still feel relevant years from now.",
  tags: ["FUNCTIONALITY", "CHARACTER", "COMFORT", "CONTEXT", "TIMELESSNESS"],
  cta: { label: "Our Approach", href: `${routes.about}#about-approach` },
} as const satisfies AboutPhilosophyContent;

export type AboutStep = {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly text: string;
};

export type AboutApproachContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly lead: string;
  readonly cta: SectionCta;
  readonly steps: readonly AboutStep[];
};

export const ABOUT_APPROACH = {
  kicker: "Our approach",
  title: ["From Vision", "to Reality"],
  lead: "Our master process summarised in five stages — the same discipline on every project, whatever its size.",
  cta: { label: "See the Full Process", href: `${routes.home}#home-process`, variant: "dark" },
  // Icons as in the original: Plan and Design share the compass (KI-D03, open).
  steps: [
    {
      icon: "search",
      title: "Understand",
      text: "Site, brief, budget and the way you live or work.",
    },
    { icon: "compass", title: "Plan", text: "Programme, approvals, budget and the right team." },
    { icon: "compass", title: "Design", text: "Architecture and interiors resolved together." },
    { icon: "crane", title: "Execute", text: "Built by our own teams to the drawing." },
    { icon: "shield", title: "Support", text: "Handover, aftercare and property care." },
  ],
} as const satisfies AboutApproachContent;

export type AboutCardsContent<Slug extends string> = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly lead: string;
  readonly cta?: SectionCta;
  readonly items: readonly Slug[];
};

/** Service cards (`#about-services .kc-grid.c4`), in the About/Services order (KI-D03). */
export const ABOUT_SERVICES = {
  kicker: "Our services",
  title: ["Everything your project", "needs. Under one roof."],
  lead: "Seven services, one team and one point of responsibility.",
  cta: { label: "Explore All Services", href: routes.services, variant: "outline" },
  items: [
    "architecture",
    "interior",
    "construction",
    "turnkey",
    "renovation",
    "exterior",
    "property-care",
  ],
} as const satisfies AboutCardsContent<RelatedServiceSlug>;

/** Division cards (`#about-divisions .kc-grid.c5`). */
export const ABOUT_DIVISIONS = {
  kicker: "Our divisions",
  title: ["One vision.", "Five divisions."],
  lead: "Specialist divisions that work together on every KATIC project.",
  items: ["design", "interior", "infrastructure", "developers", "care"],
} as const satisfies AboutCardsContent<DivisionSlug>;

export type AboutFounderContent = {
  readonly kicker: string;
  readonly name: string;
  readonly role: string;
  readonly paragraphs: readonly string[];
  readonly quote: string;
  readonly photo: SectionImage;
};

export const ABOUT_FOUNDER = {
  kicker: "Founder’s note · The vision behind KATIC",
  // TODO(content): KI-C04 placeholder name; the client supplies the founder's name.
  name: "FOUNDER NAME",
  role: "FOUNDER & PRINCIPAL ARCHITECT",
  paragraphs: [
    // TODO(content): KI-C04 placeholder name ("Founder Name").
    "Founder Name leads Katic Designs with a people-, place-, and detail-focused approach across Kerala and the UAE.",
    "The practice is built around listening, site sensitivity, and a calm, consistent architectural language that translates from concept through construction.",
  ],
  quote:
    "“Our vision is simple: one team that designs, builds and cares for spaces people are proud to live and work in.”",
  photo: { src: "people/founder", alt: "Portrait of the founder in the studio" },
} as const satisfies AboutFounderContent;

export type AboutStat = {
  /** Printed as is (no count-up on About). */
  readonly value: string;
  readonly label: string;
  readonly caption: string;
};

export type AboutExperienceContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly lead: string;
  readonly cta: AboutLink;
  readonly stats: readonly AboutStat[];
};

export const ABOUT_EXPERIENCE = {
  kicker: "Built on experience",
  title: ["Built on", "Experience"],
  lead: "Experience across residential, commercial and interior projects in Kerala and UAE.",
  cta: { label: "View Projects", href: `${routes.works}#works-list` },
  // TODO(content): KI-C10 facts to confirm ("11+" years vs "EST. 2013"; "6" disciplines vs seven
  // services / five divisions; "Spaces delivered" vs "Projects delivered").
  stats: [
    { value: "11+", label: "Years of practice", caption: "A decade of design and delivery." },
    { value: "200+", label: "Spaces delivered", caption: "Homes, workplaces and hospitality." },
    { value: "2", label: "Regions", caption: "Kerala and the United Arab Emirates." },
    { value: "6", label: "Disciplines", caption: "One integrated creative vision." },
  ],
} as const satisfies AboutExperienceContent;

export type TeamMember = {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly photo: SectionImage;
};

export type AboutTeamContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly body: string;
  readonly members: readonly TeamMember[];
};

export const ABOUT_TEAM = {
  kicker: "Management team",
  title: ["The People Behind", "the Vision"],
  body: "The people guiding strategy, design direction and delivery across Kerala and the UAE.",
  // TODO(content): KI-C04 placeholder names ("Manager Name 01–04"); the client supplies the team.
  members: [
    {
      name: "Manager Name 01",
      role: "DESIGN DIRECTOR",
      bio: "Leads design strategy, material direction and the translation of briefs into thoughtful built environments.",
      photo: { src: "people/team-member-01", alt: "Portrait of the design director" },
    },
    {
      name: "Manager Name 02",
      role: "OPERATIONS LEAD",
      bio: "Oversees project coordination, timelines and delivery across architecture, interiors and construction.",
      photo: { src: "people/team-member-02", alt: "Portrait of the operations lead" },
    },
    {
      name: "Manager Name 03",
      role: "CLIENT PARTNER",
      bio: "Builds long-term relationships and helps clients align their goals with the right design and delivery path.",
      photo: { src: "people/team-member-03", alt: "Portrait of the client partner" },
    },
    {
      name: "Manager Name 04",
      role: "STUDIO MANAGER",
      bio: "Coordinates studio workflow, resourcing and the day-to-day systems that keep projects moving smoothly.",
      photo: { src: "people/team-member-04", alt: "Portrait of the studio manager" },
    },
  ],
} as const satisfies AboutTeamContent;

/** Tile shapes of the works mosaic: `big` spans two columns, `tall` two rows. */
export type AboutWorksTileLayout = "big" | "tall" | "small";

export type AboutWorksContent = {
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  readonly cta: AboutLink;
  /** Exactly four projects, in the original's DOM order (big, tall, small, small). */
  readonly tiles: readonly {
    readonly project: ProjectSlug;
    readonly layout: AboutWorksTileLayout;
  }[];
};

export const ABOUT_WORKS = {
  kicker: "Selected works",
  title: "OUR WORK SPEAKS",
  body: "Homes, workplaces and interiors united by clarity, craft and the way people truly live.",
  cta: { label: "View All Projects", href: `${routes.works}#works-list` },
  tiles: [
    { project: "obsidian-lounge-kochi", layout: "big" },
    { project: "villa-noor", layout: "tall" },
    { project: "the-courtyard-house", layout: "small" },
    { project: "canvas-kitchen", layout: "small" },
  ],
} as const satisfies AboutWorksContent;

export type AboutContactContent = {
  readonly kicker: string;
  readonly heading: readonly string[];
  readonly lead: string;
  readonly channels: readonly ContactChannel[];
  readonly form: EnquiryFormConfig;
};

/** The original's CONTACT template as rendered on About (`#about-contact`, no FAQ). */
export const ABOUT_CONTACT = {
  kicker: "Get in Touch",
  heading: ["Have a Project in", "Mind?"],
  lead: "Tell us a little about your site, timeline, and the service you need — we’ll get back to you within one business day to schedule a first conversation.",
  channels: ["email", "phone"],
  form: { service: { mode: "select" } },
} as const satisfies AboutContactContent;
