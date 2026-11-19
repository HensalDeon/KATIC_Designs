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
  news: "/news",
  blog: "/blog",
  blogCategory: (category: string) => `/blog/category/${category}`,
  article: (slug: string) => `/blog/${slug}`,
  reviews: "/reviews",
  thankYou: "/thank-you",
} as const;
