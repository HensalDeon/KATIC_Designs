/**
 * Every internal URL in one place, so links never drift from the route structure
 * (docs/MIGRATION_PLAN.md §1, DECISIONS P0-08).
 */
export const SERVICE_SLUGS = [
  "architecture",
  "interior",
  "factory",
  "construction",
  "turnkey",
  "renovation",
  "exterior",
  "property-care",
] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const DIVISION_SLUGS = [
  "design",
  "interior",
  "infrastructure",
  "developers",
  "care",
] as const;
export type DivisionSlug = (typeof DIVISION_SLUGS)[number];

export const LOCATION_SLUGS = ["india", "dubai"] as const;
export type LocationSlug = (typeof LOCATION_SLUGS)[number];

/**
 * India project filters (the original's `data-f` on `#india-projects`): Kochi and the rest of
 * Kerala (`kerala`, KI-F22).
 */
export const INDIA_AREAS = ["kochi", "kerala"] as const;
export type IndiaArea = (typeof INDIA_AREAS)[number];

/** Id of India's filterable project grid section (kept from the original). */
export const INDIA_PROJECTS_ID = "india-projects";

/** Works filters (original `data-f` values). */
export const WORKS_CATEGORIES = [
  "residential",
  "commercial",
  "institutional",
  "hospitality",
  "architecture",
  "interiors",
  "villas",
] as const;
export type WorksCategory = (typeof WORKS_CATEGORIES)[number];

export const routes = {
  home: "/",
  about: "/about",
  services: "/services",
  service: (slug: ServiceSlug) => `/services/${slug}`,
  works: "/works",
  worksCategory: (category: WorksCategory) => `/works?category=${category}#works-list`,
  project: (slug: string) => `/works/${slug}`,
  division: (slug: DivisionSlug) => `/divisions/${slug}`,
  location: (slug: LocationSlug) => `/locations/${slug}`,
  /** India's project grid, filtered to `area` (`?area=`), or showing every project. */
  indiaProjects: (area?: IndiaArea) =>
    area
      ? `/locations/india?area=${area}#${INDIA_PROJECTS_ID}`
      : `/locations/india#${INDIA_PROJECTS_ID}`,
  news: "/news",
  /** A news item's permalink on /news (there are no news detail pages yet, KI-F11). */
  newsItem: (slug: string) => `/news#${slug}`,
  blog: "/blog",
  blogCategory: (category: string) => `/blog/category/${category}`,
  article: (slug: string) => `/blog/${slug}`,
  reviews: "/reviews",
  thankYou: "/thank-you",
} as const;
