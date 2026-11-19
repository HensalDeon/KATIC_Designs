import { THE_COURTYARD_HOUSE } from "./the-courtyard-house";
import type { ProjectDetail } from "./types";

export type * from "./types";

/**
 * Registry of the project detail pages (`/works/[slug]`). A project has a page when it has an
 * entry; the route prerenders exactly these and answers 404 for every other slug, and
 * `projectHref` (`src/content/projects.ts`) only links a card to its own page when it is listed
 * here. To add a page, write `<slug>.ts` exporting a `ProjectDetail` and list it below.
 *
 * Only runtime-free type imports from `projects.ts` are allowed in this folder: `projects.ts`
 * imports this registry.
 */
const PROJECT_DETAILS: readonly ProjectDetail[] = [THE_COURTYARD_HOUSE];

const BY_SLUG = new Map<string, ProjectDetail>(
  PROJECT_DETAILS.map((detail) => [detail.slug, detail]),
);

/** The detail page of a project, or `undefined` for an unknown slug or a project without one. */
export function getProjectDetail(slug: string): ProjectDetail | undefined {
  return BY_SLUG.get(slug);
}

/** Whether the project with this slug has a built detail page. */
export function hasProjectDetail(slug: string): boolean {
  return BY_SLUG.has(slug);
}

/** Slugs of the projects with a built detail page, in registry order. */
export function builtProjectSlugs(): string[] {
  return PROJECT_DETAILS.map((detail) => detail.slug);
}
