import type { DubaiContextContent } from "@/components/locations/dubai/dubai-context";
import type { DubaiHeroContent } from "@/components/locations/dubai/dubai-hero";
import type { DubaiOfficeContent } from "@/components/locations/dubai/dubai-office";
import type { DubaiProjectsContent } from "@/components/locations/dubai/dubai-projects";
import type { ContactSectionContent } from "@/components/sections/contact-section";
import type { BlockBase, ContentBlock } from "@/content/blocks";
import { OFFICES } from "@/content/site";
import { routes } from "@/lib/routes";

/**
 * Dubai location page (`#p-dubai`, original lines 4097–4215, page `<style>` 4098–4156; spec in
 * docs/analysis/04 §8): SEO, the bespoke banner, the ordered blocks (generic `ContentBlock`s plus
 * three Dubai-only ones) and the page's own contact section, verbatim from the original. Shared
 * entities (services, divisions, projects) are referenced by slug, never restated (D6, KI-D01).
 * Will come from Laravel (`GET /locations/dubai`) in Phase 11.
 *
 * Image alts describe the image instead of repeating headlines (KI-A13). Placeholders the original
 * shows to visitors are kept and marked `TODO(content)` (D10).
 */

export type DubaiSeo = { readonly title: string; readonly description: string };

/** `data-title` / `data-desc` of `#p-dubai` (the title already ends in "| Katic Designs"). */
export const DUBAI_SEO = {
  title: "Architects & Interior Designers in Dubai, UAE | Katic Designs",
  description:
    "Architecture, interior design, construction and turnkey projects for residential and commercial clients in Dubai and the UAE.",
} as const satisfies DubaiSeo;

/** Ids the original gives the page's sections (legacy `#dubai/<id>` deep links). */
export const DUBAI_IDS = {
  context: "dubai-context",
  office: "dubai-office",
  /** The contact section, as the original renames it at runtime (`<page>-contact`). */
  contact: "dubai-contact",
} as const;

/** "KATIC in Dubai" (`section.s1#dubai-context`): see `DubaiContext`. */
export type DubaiContextBlock = BlockBase & { readonly type: "dubaiContext" } & DubaiContextContent;
/** Office and contact details (`section.ks#dubai-office .koff`): see `DubaiOffice`. */
export type DubaiOfficeBlock = BlockBase & { readonly type: "dubaiOffice" } & DubaiOfficeContent;
/** Project mosaic (`section.s5`): see `DubaiProjects`. */
export type DubaiProjectsBlock = BlockBase & {
  readonly type: "dubaiProjects";
} & DubaiProjectsContent;

/** Every block the Dubai page can render, in the shared stack (`BlockStack`). */
export type DubaiBlock = ContentBlock | DubaiContextBlock | DubaiOfficeBlock | DubaiProjectsBlock;

/** Banner (`#p-dubai .hero`, lines 4157–4167). */
export const DUBAI_HERO = {
  image: {
    src: "photos/villa-pool-skyline-dusk",
    alt: "Modern villa and infinity pool with the Dubai skyline at dusk",
  },
  kicker: "Katic Designs · Dubai",
  title: {
    lines: ["Architecture &", "Interior Design in"],
    accent: "Dubai.",
    accentOnNewLine: true,
  },
  lead: "Katic Designs creates residential and commercial spaces in Dubai through architecture, interior design, construction and turnkey project solutions.",
  primaryCta: { kind: "contact", label: "Start a Project", href: `#${DUBAI_IDS.contact}` },
  secondaryCta: { kind: "link", label: "Explore Our Services", href: routes.services },
  bar: {
    label: "UAE · RESIDENTIAL · COMMERCIAL",
    scroll: { label: "SCROLL TO EXPLORE", href: `#${DUBAI_IDS.context}` },
  },
} as const satisfies DubaiHeroContent;

/**
 * The page's blocks in the original's order. Tones alternate from white after the hero, which is
 * exactly what the original renders (its `s5` and contact are flipped by `data-fx` 168/169).
 */
export const DUBAI_BLOCKS = [
  // `section.s1#dubai-context` (lines 4169–4178).
  {
    type: "dubaiContext",
    id: DUBAI_IDS.context,
    image: {
      src: "photos/courtyard-reflecting-pool",
      alt: "Shaded courtyard with a long reflecting water channel and palms",
    },
    caption: ["CLIMATE-AWARE LIVING", "Dubai, UAE"],
    kicker: "KATIC in Dubai",
    title: ["KATIC in", "Dubai."],
    body: "KATIC brings its integrated design-and-build practice to Dubai, with a local presence and the full capability of our India teams. Our approach responds to Dubai’s climate, contemporary urban environment, lifestyle and project requirements. We focus on thoughtful planning, natural light, materials, functionality and refined detailing.",
    cta: { label: "Our Process", href: `${routes.service("architecture")}#process` },
  },
  // `section.ks.dk` services (line 4179).
  {
    type: "related",
    header: {
      kicker: "Services in Dubai",
      title: ["Our services", "in Dubai"],
      lead: "Every KATIC service is available to clients in Dubai and the UAE.",
      cta: { label: "All Services", href: routes.services, variant: "dark" },
    },
    columns: 4,
    services: [
      "architecture",
      "interior",
      "construction",
      "turnkey",
      "renovation",
      "exterior",
      "property-care",
    ],
  },
  // `section.ks` divisions (line 4180).
  {
    type: "divisionCards",
    header: { kicker: "Our divisions", title: ["One vision.", "Five divisions."] },
    columns: 5,
    divisions: ["design", "interior", "infrastructure", "developers", "care"],
  },
  // `section.ks.dk .ksplit` (line 4181).
  {
    type: "split",
    image: {
      src: "photos/villa-pool-skyline-dusk",
      alt: "Modern villa and infinity pool with the Dubai skyline at dusk",
    },
    caption: "Dubai → India",
    kicker: "Cross-border project collaboration",
    title: ["Living in Dubai.", "Building in India."],
    lead: "For Dubai-based clients building homes or investments in India, KATIC coordinates the whole project across both locations.",
    bullets: [
      "Team coordination",
      "Design & technical coordination",
      "Construction support",
      "Procurement & vendors",
      "Agreed progress reporting",
      "Site visits on your behalf",
    ],
    cta: { kind: "contact", label: "Discuss a Cross-Border Project", variant: "primary" },
  },
  // `section.ks .ksteps` (line 4182).
  {
    type: "process",
    header: {
      kicker: "India + Dubai connectivity",
      title: ["How it works", "in practice"],
      lead: "Clear responsibilities and regular updates, wherever you are.",
    },
    steps: [
      {
        icon: "team",
        title: "Coordination",
        text: "Our Dubai contact works directly with teams across India.",
      },
      {
        icon: "message",
        title: "Communication",
        text: "One point of contact across both locations and time zones.",
      },
      {
        icon: "eye",
        title: "Progress updates",
        text: "Photo and video updates at agreed intervals.",
      },
      {
        icon: "layers",
        title: "Milestone reviews",
        text: "Online reviews at each key milestone, with approvals.",
      },
      {
        icon: "team",
        title: "Clear responsibilities",
        text: "A written scope that says who does what.",
      },
    ],
  },
  // `section.ks.dk .kfeat` (line 4183).
  {
    type: "features",
    header: { kicker: "Why KATIC", title: ["Why clients in", "Dubai choose us"] },
    columns: 4,
    items: [
      {
        icon: "team",
        title: "Integrated capabilities",
        text: "Design, interiors, construction and care in one team.",
      },
      { icon: "pin", title: "Local presence", text: "A Dubai contact who knows your project." },
      {
        icon: "pin",
        title: "Cross-border connectivity",
        text: "Projects in India managed from Dubai.",
      },
      {
        icon: "team",
        title: "Clear responsibilities",
        text: "One contract and agreed reporting.",
      },
    ],
  },
  // `section.ks#dubai-office .koff` (line 4185).
  {
    type: "dubaiOffice",
    id: DUBAI_IDS.office,
    kicker: "Dubai office & contact",
    title: ["Visit or call", "our Dubai team"],
    details: [
      {
        term: "Office",
        value: "KATIC Designs, Business Bay, Dubai, UAE",
        // TODO(content): KI-C04 placeholder shown to visitors in the original (KI-C02).
        note: "Address placeholder — replace with the confirmed office address.",
      },
      {
        term: "Telephone",
        // TODO(content): KI-C04 placeholder number (KI-C01).
        value: "+971 0 000 0000",
        href: "tel:+97100000000",
      },
      { term: "Email", value: OFFICES.dubai.email, href: `mailto:${OFFICES.dubai.email}` },
      { term: "Hours", value: "Mon–Fri · 9:00 AM–6:00 PM GST" },
    ],
    directions: {
      label: "Get Directions",
      href: "https://www.google.com/maps/search/?api=1&query=Business+Bay+Dubai",
    },
    image: {
      src: "photos/courtyard-reflecting-pool",
      alt: "Shaded courtyard with a long reflecting water channel and palms",
    },
  },
  // `section.s5` (lines 4186–4200).
  {
    type: "dubaiProjects",
    kicker: "Our work",
    title: ["Our Dubai", "Projects."],
    body: "Selected projects, prioritising our Dubai work. Projects from other locations are labelled with their city. Each project connects to its dedicated case study with project details, photography and services provided.",
    rows: [
      {
        layout: "wide-first",
        cards: [
          {
            project: "jumeirah-courtyard-house",
            label: "RESIDENTIAL VILLA",
            scope: "ARCHITECTURE",
          },
          { project: "palm-residence", label: "PRIVATE RESIDENCE", scope: "INTERIOR DESIGN" },
        ],
      },
      {
        layout: "narrow-first",
        cards: [
          { project: "desert-edge-villa", label: "NEW BUILD", scope: "TURNKEY PROJECT" },
          {
            project: "difc-gallery-office",
            label: "COMMERCIAL WORKSPACE",
            scope: "INTERIOR DESIGN",
          },
        ],
      },
    ],
    cta: { label: "View Our Work", href: `${routes.works}#works-list` },
  },
] as const satisfies readonly DubaiBlock[];

/**
 * The page's own contact section (`section.contact[data-src=dubai]`, lines 4202–4214). Unlike the
 * shared CONTACT template it is inline markup: its own heading with an orange line, WhatsApp in the
 * channel list, and Project Location before Project Type (the reverse of India). Phone and WhatsApp
 * are the site placeholders (KI-C01).
 */
export const DUBAI_CONTACT = {
  kicker: "Start your project",
  heading: { lines: ["Start Your Project"], accent: "in Dubai or India" },
  lead: "For projects in Dubai and the UAE, and for Dubai-based clients building across India.",
  channels: ["email", "phone", "whatsapp"],
  form: {
    service: { mode: "select" },
    extraFields: [
      {
        name: "location",
        label: "Project Location",
        options: ["Dubai / UAE", "Kerala, India", "Elsewhere in India"],
      },
      {
        name: "projectType",
        label: "Project Type",
        options: ["Residential", "Commercial", "Institutional", "Hospitality"],
      },
    ],
    // The original's PREFILL (`dubai: {loc:'Dubai, UAE'}`) on "go to contact".
    prefillLocation: "Dubai, UAE",
  },
} as const satisfies ContactSectionContent;
