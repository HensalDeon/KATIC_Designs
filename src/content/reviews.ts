import type { ServiceIconName } from "@/components/icons/service-icon";
import type { SectionImage } from "@/components/sections/section-image";
import type { AccentTitle, TitleLines } from "@/content/blocks";
import { routes, type ServiceSlug } from "@/lib/routes";

import type { ProjectSlug } from "./projects";
import type { TestimonialId } from "./testimonials";

/**
 * Reviews (`#p-reviews`, original lines 4216–4379, page `<style>` 4217–4285;
 * docs/analysis/04 §9): every section's copy, verbatim from the original. Testimonials come from
 * the shared pool (`testimonials.ts`) and project cards from `projects.ts`, referenced by id (D6).
 * Will come from Laravel (`GET /pages/reviews`, `GET /testimonials`) in Phase 11.
 *
 * Image alts describe the image instead of repeating headlines or carrying "↗" (KI-A13).
 */

/** A link button (`.btn`). */
export type ReviewsLink = { readonly label: string; readonly href: string };

/**
 * Home's enquiry form (`#start`): Reviews has no contact section, so the original's
 * `data-go="contact"` takes the visitor to Home's form, as on Works and the project page.
 */
const HOME_CONTACT_HREF = `${routes.home}#start`;

/** The portfolio grid on Works (`#works/works-list`). */
const WORKS_LIST_HREF = `${routes.works}#works-list`;

/** `data-title` / `data-desc` of `#p-reviews` (the title already ends in "| Katic Designs"). */
export const REVIEWS_SEO = {
  title: "Client Reviews & Testimonials | Katic Designs",
  description:
    "What homeowners and businesses say about working with Katic Designs on design and build projects.",
} as const;

export type ReviewsHeroContent = {
  readonly image: SectionImage;
  readonly kicker: string;
  readonly title: AccentTitle;
  readonly lead: string;
  readonly cta: ReviewsLink;
};

/** `.hero` (4287–4295): the same photo as the Works hero. */
export const REVIEWS_HERO = {
  image: { src: "photos/dark-lounge-interior", alt: "Dark lounge interior with artwork" },
  kicker: "Client experiences",
  title: { lines: ["Spaces That Speak", "for"], accent: "Themselves." },
  lead: "Hear from clients who worked with Katic Designs across architecture, interiors and construction.",
  cta: { label: "Start Your Project", href: HOME_CONTACT_HREF },
} as const satisfies ReviewsHeroContent;

export type ReviewsTrustContent = {
  readonly kicker: string;
  readonly title: TitleLines;
  readonly text: string;
  readonly cta: ReviewsLink;
  readonly image: SectionImage;
  /** The dark caption box over the photo (`.bx`). */
  readonly caption: { readonly label: string; readonly text: string };
};

/** `section.tr` (4297–4307). */
export const REVIEWS_TRUST = {
  kicker: "A considered way of working",
  title: ["Built on trust.", "Defined by", "experience."],
  text: "Every project is a collaboration. From the first conversation to the final detail, we work closely with our clients to create spaces that reflect their needs, lifestyle and aspirations.",
  cta: { label: "About Katic", href: routes.about },
  image: { src: "photos/open-pavilion-lounge-night", alt: "Open timber pavilion lounge at night" },
  caption: {
    label: "SPACES MADE PERSONAL",
    text: "A warm, lived-in interior shaped around everyday rituals.",
  },
} as const satisfies ReviewsTrustContent;

export type ReviewsClientsContent = {
  readonly kicker: string;
  readonly title: TitleLines;
  readonly text: string;
  readonly testimonials: readonly TestimonialId[];
  readonly note: string;
  readonly cta: ReviewsLink;
};

/** `section.cl` (4309–4323): six testimonials from the shared pool, in the original's order. */
export const REVIEWS_CLIENTS = {
  // TODO(content): KI-C08 placeholder kicker and note; replace once the client approves the quotes.
  kicker: "Representative client experiences • copy pending approval",
  title: ["What our clients", "say"],
  text: "Thoughtful partnerships, described through anonymized representative experiences across homes, workplaces and complete builds.",
  testimonials: ["home-kochi", "ernakulam", "thrissur", "kozhikode", "arch", "alappuzha"],
  note: "Representative testimonials — replace with approved client copy before publication.",
  cta: { label: "View Our Work", href: WORKS_LIST_HREF },
} as const satisfies ReviewsClientsContent;

export type ReviewsExpertiseCard = {
  readonly service: ServiceSlug;
  readonly title: string;
  readonly text: string;
  readonly icon: ServiceIconName;
  readonly image: SectionImage;
};

export type ReviewsExpertiseContent = {
  readonly kicker: string;
  readonly title: TitleLines;
  readonly cta: ReviewsLink;
  readonly cards: readonly ReviewsExpertiseCard[];
};

/** `section.xp` (4324–4334): four discipline cards, each opening its service page. */
export const REVIEWS_EXPERTISE = {
  kicker: "Reviews by expertise",
  title: ["Experience across", "every discipline"],
  cta: { label: "Explore Services", href: routes.services },
  cards: [
    {
      service: "architecture",
      title: "Architecture",
      text: "Residential and commercial architecture shaped by site, light, context and the way people move through space.",
      icon: "house",
      image: {
        src: "photos/arched-courtyard-terrace",
        alt: "Courtyard terrace with arches and patterned tiles",
      },
    },
    {
      service: "interior",
      title: "Interior Design",
      text: "Planning, materials, detailing and execution brought together to create expressive, enduring interiors.",
      icon: "sofa",
      image: {
        src: "photos/open-pavilion-lounge-night",
        alt: "Open timber pavilion lounge at night",
      },
    },
    {
      service: "construction",
      title: "Construction",
      text: "Quality, coordination and site execution managed with discipline, transparency and close attention to detail.",
      icon: "crane",
      image: {
        src: "photos/granite-kitchen",
        alt: "Kitchen with granite worktops and white cabinets",
      },
    },
    {
      service: "turnkey",
      title: "Turnkey Projects",
      text: "One integrated design-and-build team, aligning vision, decisions and delivery from first brief to handover.",
      icon: "key",
      image: { src: "photos/games-room-billiards", alt: "Games room with a billiards table" },
    },
  ],
} as const satisfies ReviewsExpertiseContent;

export type ReviewsStoryRow = {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly text: string;
};

export type ReviewsStoryContent = {
  readonly kicker: string;
  readonly title: TitleLines;
  /** Right-aligned uppercase facts beside the title (`.rt`). */
  readonly facts: readonly string[];
  /** The large photo, then the three thumbnails (`.big`, `.th`); all open the lightbox. */
  readonly images: readonly [SectionImage, SectionImage, SectionImage, SectionImage];
  /** Includes the original's curly quotes. */
  readonly quote: string;
  readonly attribution: string;
  readonly rows: readonly ReviewsStoryRow[];
  readonly cta: ReviewsLink;
};

/** `section.pp-host.bb` (4336–4352): the featured story. */
export const REVIEWS_STORY = {
  // TODO(content): KI-C08 placeholder kicker and attribution; replace once the client approves.
  kicker: "Featured representative story • pending client approval",
  title: ["From brief to built"],
  facts: ["PRIVATE FAMILY RESIDENCE", "ARCHITECTURE + INTERIORS", "CENTRAL KERALA"],
  images: [
    {
      src: "photos/dark-lounge-interior",
      alt: "Dark lounge with cream sofas, a ring pendant and botanical artwork",
    },
    { src: "photos/granite-kitchen", alt: "Kitchen with granite worktops and white cabinets" },
    { src: "photos/games-room-billiards", alt: "Games room with a billiards table" },
    { src: "photos/open-pavilion-lounge-night", alt: "Open timber pavilion lounge at night" },
  ],
  quote:
    "“We wanted a home that could feel calm every day, welcome our extended family, and still remain connected to the garden. Katic helped us make each decision with confidence—from the first plan to the final material. The completed home feels generous without being excessive, and deeply personal without trying too hard.”",
  attribution: "— Homeowner · Representative testimonial pending approval",
  rows: [
    {
      icon: "star",
      title: "The requirement",
      text: "A private family home that balanced togetherness and retreat, with natural light, garden views and practical space for multigenerational living.",
    },
    {
      icon: "compass",
      title: "The design journey",
      text: "The plan evolved through close workshops around routines, privacy and material character. Architecture, interiors and site coordination moved as one conversation.",
    },
    {
      icon: "star",
      title: "The outcome",
      text: "A warm, light-filled residence with clear circulation, crafted details and flexible spaces that now support both quiet weekdays and large family gatherings.",
    },
  ],
  // `#project`: The Courtyard House page.
  cta: { label: "View Project", href: routes.project("the-courtyard-house") },
} as const satisfies ReviewsStoryContent;

export type ReviewsProjectsContent = {
  readonly kicker: string;
  readonly title: TitleLines;
  readonly text: string;
  readonly cta: ReviewsLink;
  readonly projects: readonly ProjectSlug[];
};

/** `section.sp` (4353–4366): six project cards. */
export const REVIEWS_PROJECTS = {
  kicker: "Projects behind the reviews",
  title: ["See the spaces. Meet", "the stories."],
  text: "A selection of completed spaces connected to the representative experiences shared above.",
  cta: { label: "Explore Our Work", href: WORKS_LIST_HREF },
  projects: [
    "courtyard-residence",
    "garden-house",
    "the-social-kitchen",
    "quiet-play-house",
    "monsoon-court",
    "studio-commons",
  ],
} as const satisfies ReviewsProjectsContent;

export type ReviewsCtaContent = {
  readonly image: SectionImage;
  readonly kicker: string;
  readonly title: TitleLines;
  readonly text: string;
  readonly cta: ReviewsLink;
};

/** `section.ctasec` (4368–4376). */
export const REVIEWS_CTA = {
  image: {
    src: "photos/garden-room-window-seat",
    alt: "Garden room with tall timber windows, built-in seating and tropical planting",
  },
  kicker: "Begin a conversation",
  title: ["Ready to Create Your", "Own Space?"],
  text: "Tell us about your project and let’s start a conversation.",
  cta: { label: "Start Your Project", href: HOME_CONTACT_HREF },
} as const satisfies ReviewsCtaContent;
