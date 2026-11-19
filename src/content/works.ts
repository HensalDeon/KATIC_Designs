import type { ServiceIconName } from "@/components/icons/service-icon";
import type { CtaBandCall } from "@/components/sections/cta-band";
import type { SectionImage } from "@/components/sections/section-image";
import { type DivisionSlug, routes, type ServiceSlug } from "@/lib/routes";

import type { RichText, TitleLine } from "./home/hero";
import type { ShowcaseFilter } from "./home/works";
import type { ProjectSlug } from "./projects";
import type { SectorKey } from "./sectors";

/**
 * Works listing (`#p-works`, original lines 3604–3781, page `<style>` 3605–3693;
 * docs/analysis/04 §1): every section's copy, verbatim from the original. Project cards are
 * projects referenced by slug (`src/content/projects.ts`, D6/KI-D01), never restated here. Will
 * come from Laravel (`GET /pages/works`) in Phase 11.
 *
 * Image alts describe the image instead of repeating headlines (KI-A13).
 */

/** A link button (`.btn`). */
export type WorksLink = { readonly label: string; readonly href: string };

export type WorksSeo = { readonly title: string; readonly description: string };

/** `data-title` / `data-desc` of `#p-works` (the title already ends in "| Katic Designs"). */
export const WORKS_SEO = {
  title: "Architecture & Interior Design Projects | Portfolio | Katic Designs",
  description:
    "Residential, commercial, institutional and hospitality projects by Katic Designs across Kerala, South India and Dubai.",
} as const satisfies WorksSeo;

/** The portfolio section id (`section.sw#works-list`); legacy `#works/works-list/<f>` links land here. */
export const WORKS_LIST_ID = "works-list";

export type WorksHeroContent = {
  readonly image: SectionImage;
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly lead: string;
  readonly cta: WorksLink;
  /**
   * The "current project" note at the right of the canvas (`a.cur`, hidden below 1100px). It links
   * to `project`; the label and meta are printed as the original renders them.
   */
  readonly current: {
    readonly project: ProjectSlug;
    readonly label: string;
    readonly meta: string;
  };
};

export const WORKS_HERO = {
  image: { src: "photos/dark-lounge-interior", alt: "Dark lounge interior with artwork" },
  kicker: "KATIC Projects · Kerala & UAE",
  title: ["Built Ideas.", { accent: "Real Places." }],
  lead: "Explore architecture, interiors and construction projects across Kerala and UAE.",
  cta: { label: "Explore Projects", href: `${routes.works}#${WORKS_LIST_ID}` },
  current: {
    project: "the-courtyard-house",
    // TODO(content): KI-D01 the hero says "Courtyard House · Kochi, Kerala"; the project entity
    // (from About) says Thrissur, Kerala. The client confirms the location.
    label: "Courtyard House",
    meta: "Kochi, Kerala · 2025",
  },
} as const satisfies WorksHeroContent;

export type WorksFeaturedContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly text: string;
  /** The project the feature opens (`a.im` and "View Project"). */
  readonly project: ProjectSlug;
  /** Name printed over the photo. */
  readonly name: string;
  readonly image: SectionImage;
  /** Dark tag at the top left of the photo (`.tag`). */
  readonly tag: string;
  /** Orange reference at the bottom right of the photo (`em`). */
  readonly code: string;
  /** Uppercase crumb, separated by orange slashes (`.crumb`). */
  readonly crumb: readonly string[];
  readonly heading: string;
  readonly description: string;
  readonly cta: string;
  /** The three figures under a rule (`.sts`). */
  readonly stats: readonly { readonly value: string; readonly label: string }[];
};

export const WORKS_FEATURED = {
  kicker: "Featured projects",
  title: ["A home shaped by", "light, shade and", "the monsoon."],
  text: "Our featured work pairs rigorous architecture with tactile interiors—designed as one continuous experience from first sketch to final detail.",
  // The original links the feature to the only project page, The Courtyard House.
  project: "the-courtyard-house",
  // TODO(content): KI-F10 the feature is "The Rain Court House" (6,800 sq ft, KD / 024) but opens
  // The Courtyard House (4,850 sq ft). Kept as rendered until the client says which project it is.
  name: "The Rain Court House",
  image: {
    src: "photos/house-reflecting-pool-garden",
    alt: "House with a long reflecting pool through the garden",
  },
  tag: "Signature Residence · 2025",
  code: "KD / 024",
  crumb: ["KOCHI", "RESIDENTIAL", "ARCHITECTURE + INTERIORS"],
  heading: "Quiet rooms gather around a living courtyard.",
  description:
    "Designed for a multi-generational family, the residence turns inward to a rain garden that brings daylight, breeze and the sound of water into every room. Local stone, lime plaster and finely detailed teak temper the bold concrete shell.",
  cta: "View Project",
  stats: [
    { value: "6,800", label: "SQ. FT." },
    { value: "18 mo", label: "BUILD TIME" },
    { value: "A+", label: "ENERGY GRADE" },
  ],
} as const satisfies WorksFeaturedContent;

export type WorksSectorsContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly lead: string;
  /** Sector tiles (`.ksec`), each opening the portfolio filtered by its sector. */
  readonly sectors: readonly SectorKey[];
};

export const WORKS_SECTORS = {
  kicker: "Project categories",
  title: ["Four sectors.", "One standard."],
  lead: "Browse our work by sector — each opens a filtered portfolio.",
  sectors: ["residential", "commercial", "institutional", "hospitality"],
} as const satisfies WorksSectorsContent;

export type WorksPortfolioContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly text: string;
  /** Filter buttons (`.fl button`), in the original order. */
  readonly filters: readonly ShowcaseFilter[];
  /** Accessible name of the filter group. */
  readonly filtersLabel: string;
  /** Cards in the original order (`.pj`). */
  readonly projects: readonly ProjectSlug[];
  /** Card link label (`.v`; the arrow is drawn by the component). */
  readonly cardLinkLabel: string;
};

export const WORKS_PORTFOLIO = {
  kicker: "Portfolio · Filter & explore",
  title: ["Places with", "purpose. Details", "with staying", "power."],
  // TODO(content): KI-C09 the original prints this sentence twice; it is shown once. KI-C07: brief
  // filler until the client supplies the copy.
  text: "Browse a considered portfolio of residences, workplaces and hospitality spaces across Kerala and the UAE.",
  filters: [
    { label: "All", category: "all" },
    { label: "Residential", category: "residential" },
    { label: "Commercial", category: "commercial" },
    { label: "Institutional", category: "institutional" },
    { label: "Hospitality", category: "hospitality" },
    { label: "Architecture", category: "architecture" },
    { label: "Interiors", category: "interiors" },
    { label: "Villas / Flats", category: "villas" },
  ],
  filtersLabel: "Filter projects by category",
  projects: [
    "palm-veil-residence",
    "cinder-house",
    "nila-apartments",
    "serein-wellness-club",
    "house-of-three-courts",
    "al-quoz-atelier",
    "greenfield-school-campus",
    "difc-gallery-office",
  ],
  cardLinkLabel: "View Project",
} as const satisfies WorksPortfolioContent;

export type WorksCaseStudyContent = {
  readonly project: ProjectSlug;
  readonly image: SectionImage;
  readonly caption: string;
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly lead: string;
  readonly body: RichText;
  readonly facts: readonly string[];
  readonly cta: string;
};

export const WORKS_CASE_STUDY = {
  project: "the-courtyard-house",
  image: {
    src: "photos/brick-courtyard-house-dusk",
    alt: "Brick courtyard house lit at dusk around a planted courtyard",
  },
  // TODO(content): KI-D01 the case study places the house in Kakkanad, Kochi (4,850 sq ft); the
  // project entity (from About) says Thrissur, Kerala. Kept as rendered until the client confirms.
  caption: "Kakkanad · Kochi",
  kicker: "Selected case study",
  title: ["The Courtyard", "House"],
  lead: "Concept: a calm family home organised around a planted courtyard that draws light, rain and breeze into every room.",
  body: [
    { strong: "Challenge:" },
    " a narrow, busy-road site with close neighbours, strong western heat and heavy monsoon rain. ",
    { strong: "Outcome:" },
    " an inward-looking plan with deep overhangs, teak screens and cross-ventilation — private, cool and open to the landscape.",
  ],
  facts: ["Kakkanad, Kochi", "4,850 sq ft", "Architecture + Interiors", "Completed 2025"],
  cta: "View Case Study",
} as const satisfies WorksCaseStudyContent;

export type WorksCapability = {
  readonly service: ServiceSlug;
  readonly title: string;
  readonly text: string;
  readonly image: SectionImage;
  readonly icon: ServiceIconName;
};

export type WorksCapabilitiesContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly text: string;
  readonly cards: readonly WorksCapability[];
  readonly cardLinkLabel: string;
};

export const WORKS_CAPABILITIES = {
  kicker: "Our capabilities",
  title: ["Architecture,", "interior design,", "construction and", "turnkey projects."],
  // TODO(content): KI-C09 the original repeats this sentence three times over two paragraphs; it is
  // shown once. KI-C07: brief filler until the client supplies the copy.
  text: "One integrated practice. Four disciplines working together to keep the original idea intact through every phase.",
  cards: [
    {
      service: "architecture",
      title: "Architecture",
      text: "Climate-conscious homes and commercial spaces resolved from site to structure.",
      image: {
        src: "photos/architectural-model-on-drawings",
        alt: "Architectural model resting on drawings beside a window",
      },
      icon: "leaf",
    },
    {
      service: "interior",
      title: "Interior Design",
      text: "Tactile, enduring interiors shaped around daily rituals and natural materiality.",
      image: { src: "photos/living-room-tv-wall", alt: "Living room with a timber TV wall" },
      icon: "sofa",
    },
    {
      service: "construction",
      title: "Construction",
      text: "Disciplined site delivery with exacting quality, coordination and accountability.",
      image: {
        src: "photos/construction-team-drawings",
        alt: "Construction team reviewing drawings on site",
      },
      icon: "crane",
    },
    {
      service: "turnkey",
      title: "Turnkey Projects",
      text: "One team from first conversation to a fully finished, ready-to-live space.",
      image: { src: "photos/formal-dining-room", alt: "Formal dining room with a chandelier" },
      icon: "key",
    },
  ],
  cardLinkLabel: "Explore Service",
} as const satisfies WorksCapabilitiesContent;

export type WorksDivisionsContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly divisions: readonly DivisionSlug[];
};

export const WORKS_DIVISIONS = {
  kicker: "Explore divisions",
  title: ["One vision.", "Five divisions."],
  divisions: ["design", "interior", "infrastructure", "developers", "care"],
} as const satisfies WorksDivisionsContent;

export type WorksCtaContent = {
  readonly image: SectionImage;
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly text: string;
  readonly cta: WorksLink;
  readonly call: CtaBandCall;
};

export const WORKS_CTA = {
  image: { src: "photos/pavilion-house-night", alt: "Glass pavilion house glowing at night" },
  kicker: "Start a project",
  title: ["Your project could be", "next."],
  text: "Tell us what you want to build, where you are, and what matters most. We’ll bring the right disciplines to the table.",
  // `#contact` + `data-go="contact"`: Works has no contact section, so the original sends visitors
  // to the home page's form (`#start`, HOME_CONTACT_ID in use-contact-scroll).
  cta: { label: "Start Your Project", href: `${routes.home}#start` },
  call: {
    label: "PREFER TO CALL?",
    // The only phone number in the original that is not a placeholder (KI-C01).
    phone: { display: "+91 8086 000 600", href: "tel:+918086000600" },
    hours: "Mon—Sat · 9:30 AM—6:30 PM IST",
  },
} as const satisfies WorksCtaContent;
