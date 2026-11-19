import { routes, type WorksCategory } from "@/lib/routes";

import type { MediaId } from "./media";
import { hasProjectDetail } from "./project-details";

/**
 * Projects: the single source of truth for every project card, filter and (later) project page
 * (decision D6, KI-D01). Pages reference projects by slug and never restate their facts, so the
 * same project can no longer show different locations, categories or images on different pages.
 * Will come from Laravel (`Project` resource) in Phase 11.
 *
 * Seeded with the 11 projects of the home "Selected Works" showcase (docs/analysis/02 §1.4), copy
 * verbatim from the original. The Works pages (Phase 7) extend this module rather than adding
 * their own project lists.
 */

/** Filter categories a project can belong to (the original's `data-cat` tokens). */
export type ProjectCategory = WorksCategory;

/**
 * The type label shown on the card pill (`.sc-pill`, the Works page `.c`). Each label belongs to
 * one category, and a project always carries the category of its own label (KI-D02; checked in
 * src/components/home/pinned-showcase.test.ts), so a card is never missing from the tab its pill
 * names.
 */
export const PROJECT_TYPE_CATEGORY = {
  Residential: "residential",
  Villa: "villas",
  /** Flats: the home tab is "Villas / Flats". */
  Apartments: "villas",
  Commercial: "commercial",
  Interiors: "interiors",
  Institutional: "institutional",
  Hospitality: "hospitality",
} as const satisfies Record<string, ProjectCategory>;
export type ProjectType = keyof typeof PROJECT_TYPE_CATEGORY;

/** Coarse location group, for location pages and filters. */
export type ProjectRegion = "kerala" | "uae" | "north-macedonia";

export type Project = {
  readonly slug: string;
  readonly name: string;
  /** As printed on cards, e.g. "Thrissur, Kerala". */
  readonly location: string;
  readonly region: ProjectRegion;
  /** Filter categories (`data-cat`). */
  readonly categories: readonly ProjectCategory[];
  /** Pill label. */
  readonly type: ProjectType;
  /** What we delivered, as printed after the location ("Architecture", "Turnkey", …). */
  readonly scope: string;
  readonly year?: number;
  /** Cover image (`.sc-card img`). */
  readonly cover: MediaId;
  /** Alt text of the cover image. */
  readonly coverAlt: string;
};

const PROJECT_LIST = [
  {
    slug: "obsidian-lounge",
    name: "Obsidian Lounge",
    // TODO(content): KI-C06 template leftover (Skopje, North Macedonia); the client supplies the real project.
    location: "Skopje, MK",
    region: "north-macedonia",
    categories: ["commercial", "interiors"],
    type: "Interiors",
    scope: "Interior",
    cover: "photos/bright-living-room",
    coverAlt: "Bright living room with a grey sofa",
  },
  {
    slug: "velvet-suite-penthouse",
    name: "Velvet Suite Penthouse",
    // TODO(content): KI-C06 template leftover (Skopje, North Macedonia).
    location: "Skopje, MK",
    region: "north-macedonia",
    categories: ["residential", "interiors", "villas"],
    type: "Interiors",
    scope: "Interior",
    cover: "photos/minimal-interior-yellow-armchair",
    coverAlt: "Minimal interior with a yellow armchair",
  },
  {
    slug: "galicica-retreat",
    name: "Galičica Retreat",
    // TODO(content): KI-C06 template leftover (Galičica, North Macedonia).
    location: "Galičica, MK",
    region: "north-macedonia",
    categories: ["commercial", "hospitality"],
    type: "Commercial",
    scope: "Hospitality",
    cover: "photos/white-bathroom-checker-floor",
    coverAlt: "White bathroom with a checkerboard floor and plants",
  },
  {
    slug: "palm-veil-residence",
    name: "Palm Veil Residence",
    location: "Thrissur, Kerala",
    region: "kerala",
    categories: ["residential", "villas", "architecture"],
    type: "Villa",
    scope: "Architecture",
    cover: "photos/modern-house-rain-dusk",
    coverAlt: "Modern house on a rain-soaked evening",
  },
  {
    slug: "cinder-house",
    name: "Cinder House",
    location: "Dubai, UAE",
    region: "uae",
    categories: ["residential", "interiors"],
    type: "Residential",
    scope: "Interiors",
    cover: "photos/city-view-living-room",
    coverAlt: "Modern living room with a curved sofa and floor-to-ceiling city views",
  },
  {
    slug: "nila-apartments",
    name: "Nila Apartments",
    location: "Kozhikode, Kerala",
    region: "kerala",
    // `villas` = the "Villas / Flats" tab; apartments are flats (KI-D02 reviewed, kept).
    categories: ["residential", "villas"],
    type: "Apartments",
    scope: "Turnkey",
    cover: "photos/apartment-tower",
    coverAlt: "Mid-rise apartment tower with planted balconies",
  },
  {
    slug: "serein-wellness-club",
    name: "Serein Wellness Club",
    location: "Abu Dhabi, UAE",
    region: "uae",
    // KI-D02: the original labels it "Commercial" but omits `commercial` from `data-cat`, so the
    // Commercial tab hid it. A wellness club is commercial hospitality: both categories apply.
    categories: ["commercial", "hospitality", "interiors"],
    type: "Commercial",
    scope: "Interior Design",
    cover: "photos/garden-veranda-chairs",
    coverAlt: "Garden veranda with cane chairs",
  },
  {
    slug: "house-of-three-courts",
    name: "House of Three Courts",
    location: "Kottayam, Kerala",
    region: "kerala",
    categories: ["residential", "architecture"],
    type: "Residential",
    scope: "Construction",
    cover: "photos/kerala-house-pond",
    coverAlt: "Traditional Kerala house with tiled roofs around a pond",
  },
  {
    slug: "al-quoz-atelier",
    name: "Al Quoz Atelier",
    location: "Dubai, UAE",
    region: "uae",
    categories: ["commercial", "architecture"],
    type: "Commercial",
    scope: "Architecture + Build",
    cover: "photos/commercial-facade-dusk",
    coverAlt: "Industrial-style commercial building lit at dusk",
  },
  {
    slug: "greenfield-school-campus",
    name: "Greenfield School Campus",
    location: "Kottayam, Kerala",
    region: "kerala",
    categories: ["institutional", "architecture"],
    type: "Institutional",
    scope: "Institutional / Architecture",
    cover: "photos/hillside-house-greenery",
    coverAlt: "House set into a green hillside",
  },
  {
    slug: "difc-gallery-office",
    name: "DIFC Gallery Office",
    location: "DIFC, Dubai",
    region: "uae",
    categories: ["commercial", "interiors"],
    type: "Commercial",
    scope: "Commercial / Interiors",
    cover: "photos/office-reception",
    coverAlt: "Office reception with timber panelling",
  },
  // The About page's "Selected works" mosaic (`#p-about .sw`, docs/analysis/02 §2.8), copy
  // verbatim. Categories and type are inferred from the printed scope: the original's About tiles
  // carry no filter data.
  {
    slug: "obsidian-lounge-kochi",
    name: "Obsidian Lounge",
    // TODO(content): KI-D01 the original also calls the Skopje interior on Home
    // (`obsidian-lounge`) "Obsidian Lounge"; the client confirms which project this is.
    location: "Kochi, Kerala",
    region: "kerala",
    categories: ["residential", "interiors"],
    type: "Residential",
    scope: "Residential Interior",
    cover: "photos/open-pavilion-lounge-night",
    coverAlt: "Open timber pavilion lounge at night",
  },
  {
    slug: "villa-noor",
    name: "Villa Noor",
    location: "Abu Dhabi, UAE",
    region: "uae",
    categories: ["residential", "villas"],
    type: "Villa",
    scope: "Turnkey Residence",
    cover: "photos/games-room-billiards",
    coverAlt: "Games room with a billiards table",
  },
  {
    slug: "the-courtyard-house",
    name: "The Courtyard House",
    // TODO(content): KI-D01 About prints Thrissur; the original project page says Kakkanad, Kochi
    // and uses other images. The client confirms the facts (Phase 7 builds the page).
    location: "Thrissur, Kerala",
    region: "kerala",
    categories: ["residential", "architecture"],
    type: "Residential",
    scope: "Architecture",
    cover: "photos/arched-courtyard-terrace",
    coverAlt: "Courtyard terrace with arches and patterned tiles",
  },
  {
    slug: "canvas-kitchen",
    name: "Canvas Kitchen",
    location: "Dubai, UAE",
    region: "uae",
    categories: ["residential", "interiors"],
    type: "Interiors",
    scope: "Interior Design",
    cover: "photos/granite-kitchen",
    coverAlt: "Kitchen with granite worktops and white cabinets",
  },
  // Service-page featured projects not shown elsewhere yet (docs/analysis/03 §2.2, §2.5); facts
  // from their cards' meta line ("Residential · Interiors · Marine Drive, Kochi").
  {
    slug: "harbour-loft",
    name: "Harbour Loft",
    location: "Marine Drive, Kochi",
    region: "kerala",
    categories: ["residential", "interiors"],
    type: "Residential",
    scope: "Interiors",
    cover: "photos/apartment-living-sea-view",
    coverAlt: "Apartment living room with sea views",
  },
  {
    slug: "desert-edge-villa",
    // TODO(content): KI-D01 the Developers division page calls it "Desert Edge Villas".
    name: "Desert Edge Villa",
    location: "Al Khawaneej, Dubai",
    region: "uae",
    categories: ["residential", "villas"],
    type: "Residential",
    scope: "Turnkey",
    cover: "photos/desert-villa-sunset",
    coverAlt: "Desert villa with an infinity pool at sunset",
  },
  // The Architecture page's featured projects (`#p-architecture .ap2`, docs/analysis/03 §1.15);
  // facts from their cards' meta line ("Kakkanad, Kerala · Villa Design"). Categories are inferred
  // from that line: the original's cards carry no filter data.
  {
    slug: "palm-ridge-villa",
    name: "Palm Ridge Villa",
    location: "Kakkanad, Kerala",
    region: "kerala",
    categories: ["residential", "villas", "architecture"],
    type: "Villa",
    scope: "Villa Design",
    cover: "photos/hillside-villa-sunset",
    coverAlt: "Villa on a hillside with palm trees at sunset",
  },
  {
    slug: "nila-workspace",
    name: "Nila Workspace",
    location: "Dubai, UAE",
    region: "uae",
    categories: ["commercial", "architecture"],
    type: "Commercial",
    scope: "Commercial Architecture",
    cover: "photos/glass-office-tower",
    coverAlt: "Glass office building with vertical fins",
  },
  {
    slug: "house-of-monsoon",
    name: "House of Monsoon",
    location: "Thrissur, Kerala",
    region: "kerala",
    categories: ["residential", "architecture"],
    type: "Residential",
    scope: "Residential Architecture",
    cover: "photos/timber-house-night",
    coverAlt: "Timber house lit at night after rain",
  },
  {
    slug: "the-old-mill-renewal",
    name: "The Old Mill Renewal",
    location: "Aluva, Kerala",
    region: "kerala",
    // An adaptive reuse "introducing a new public life": commercial architecture.
    categories: ["commercial", "architecture"],
    type: "Commercial",
    scope: "Renovation",
    cover: "photos/brick-house-arched-windows-night",
    coverAlt: "Brick house with arched windows lit at night",
  },
  // Construction featured projects (docs/analysis/03 §2.4); facts from the card's meta line
  // ("Institutional · Construction · Aluva, Kerala").
  {
    slug: "community-health-pavilion",
    name: "Community Health Pavilion",
    location: "Aluva, Kerala",
    region: "kerala",
    categories: ["institutional"],
    type: "Institutional",
    scope: "Construction",
    cover: "photos/pavilion-fins-facade",
    coverAlt: "Pavilion building with vertical fins and a garden",
  },
  // Exterior's featured projects (docs/analysis/03 §2.7); facts from their cards' meta line.
  {
    slug: "canopy-house",
    name: "Canopy House",
    location: "Thrippunithura, Kochi",
    region: "kerala",
    categories: ["residential", "architecture"],
    type: "Residential",
    scope: "Architecture",
    cover: "photos/brick-house-garden-path",
    coverAlt: "Brick house behind a garden path",
  },
  {
    slug: "jumeirah-courtyard-house",
    name: "Jumeirah Courtyard House",
    location: "Jumeirah, Dubai",
    region: "uae",
    categories: ["residential", "architecture"],
    type: "Residential",
    scope: "Architecture",
    cover: "photos/contemporary-villa-entrance",
    coverAlt: "Contemporary villa with stone cladding and a landscaped entrance path",
  },
  {
    slug: "river-edge-villa",
    name: "River Edge Villa",
    location: "Aluva, Kerala",
    region: "kerala",
    categories: ["residential", "villas"],
    type: "Residential",
    scope: "Villa",
    cover: "photos/riverside-house-night",
    coverAlt: "Riverside house glowing at night",
  },
  // The Courtyard House page's related projects (`#p-project .rl`, docs/analysis/04 §2) not shown
  // elsewhere; facts from their cards ("ARCHITECTURE · EDAPPALLY"). Categories are inferred from
  // that line: the original's cards carry no filter data.
  {
    slug: "linear-courtyard-home",
    name: "Linear Courtyard Home",
    // TODO(content): KI-D01 the original card only says "EDAPPALLY"; "Kochi" is inferred.
    location: "Edappally, Kochi",
    region: "kerala",
    categories: ["residential", "architecture"],
    type: "Residential",
    scope: "Architecture",
    cover: "photos/garden-path-modern-house",
    coverAlt: "Stone garden path leading to a white modern house",
  },
  {
    slug: "garden-fold-house",
    name: "Garden Fold House",
    location: "Kochi, Kerala",
    region: "kerala",
    categories: ["residential", "architecture", "interiors"],
    type: "Residential",
    scope: "Architecture + Interiors",
    cover: "photos/narrow-urban-house-dusk",
    coverAlt: "Narrow urban house lit at dusk",
  },
  // The Dubai page's project mosaic (`#p-dubai .s5`, docs/analysis/04 §8) not shown elsewhere;
  // facts from its card ("PRIVATE RESIDENCE", "Palm Jumeirah, Dubai · INTERIOR DESIGN").
  // Categories are inferred from that line: the original's cards carry no filter data.
  {
    slug: "palm-residence",
    name: "Palm Residence",
    location: "Palm Jumeirah, Dubai",
    region: "uae",
    categories: ["residential", "interiors"],
    type: "Residential",
    scope: "Interior Design",
    cover: "photos/sea-view-living-room",
    coverAlt: "Living room with curved sofas and floor-to-ceiling sea views",
  },
] as const satisfies readonly Project[];

export type ProjectSlug = (typeof PROJECT_LIST)[number]["slug"];

export const PROJECTS: readonly Project[] = PROJECT_LIST;

const BY_SLUG = new Map<string, Project>(PROJECT_LIST.map((project) => [project.slug, project]));

/** Whether `slug` names a project (e.g. a `[slug]` route parameter). */
export function isProjectSlug(slug: string): slug is ProjectSlug {
  return BY_SLUG.has(slug);
}

/** The project with this slug. Slugs are typed, and an unknown one throws (fails the build). */
export function getProject(slug: ProjectSlug): Project {
  const project = BY_SLUG.get(slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
}

/** Resolves a list of slugs, keeping their order. */
export function getProjects(slugs: readonly ProjectSlug[]): Project[] {
  return slugs.map((slug) => getProject(slug));
}

/** Whether a project belongs to a filter; `"all"` matches every project. */
export function inCategory(project: Project, category: ProjectCategory | "all"): boolean {
  return category === "all" || project.categories.includes(category);
}

/** The projects of `list` (default: all) in a category, in their original order. */
export function projectsByCategory(
  category: ProjectCategory | "all",
  list: readonly Project[] = PROJECTS,
): Project[] {
  return list.filter((project) => inCategory(project, category));
}

/** "Thrissur, Kerala — Architecture" (`.sc-ov p`). */
export function projectLocationLine(project: Project): string {
  return `${project.location} — ${project.scope}`;
}

/**
 * The project every card links to while its own page does not exist: the original links all ~45
 * project cards to its one project page (`href="#project"`, The Courtyard House).
 */
export const FALLBACK_PROJECT_SLUG = "the-courtyard-house" satisfies ProjectSlug;

/**
 * Where a project card links. A project with a built detail page (`src/content/project-details`)
 * links to its own `/works/<slug>`; every other project keeps the original's behaviour and links to
 * The Courtyard House page, so no card ever leads to a 404. Tracked as KI-F09 until every project
 * has its page; adding a project to the detail registry switches its cards over automatically.
 */
export function projectHref(project: Project): string {
  return routes.project(hasProjectDetail(project.slug) ? project.slug : FALLBACK_PROJECT_SLUG);
}
