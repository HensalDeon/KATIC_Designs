import { routes, type WorksCategory } from "@/lib/routes";

import type { MediaId } from "./media";

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

/** Detail page URL (the original links every card to the generic `#project`). */
export function projectHref(project: Project): string {
  return routes.project(project.slug);
}
