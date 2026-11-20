import { DIVISION_SLUGS, type DivisionSlug } from "@/lib/routes";
import type { DivisionPage } from "@/lib/schemas/divisions";

import { CARE_DIVISION_PAGE } from "./care";
import { DESIGN_DIVISION_PAGE } from "./design";
import { DEVELOPERS_DIVISION_PAGE } from "./developers";
import { INFRASTRUCTURE_DIVISION_PAGE } from "./infrastructure";
import { INTERIOR_DIVISION_PAGE } from "./interior";
import { divisionPageBlocks } from "./shared";
import type { DivisionPageContent } from "./types";

export type { DivisionPageContent } from "./types";

/**
 * Registry of the division pages (`/divisions/[slug]`). A page is built when it has an entry;
 * `/divisions/[slug]` prerenders exactly these and answers 404 for the rest.
 */
export const DIVISION_PAGES: Readonly<Record<DivisionSlug, DivisionPageContent | undefined>> = {
  design: DESIGN_DIVISION_PAGE,
  interior: INTERIOR_DIVISION_PAGE,
  infrastructure: INFRASTRUCTURE_DIVISION_PAGE,
  developers: DEVELOPERS_DIVISION_PAGE,
  care: CARE_DIVISION_PAGE,
};

function isDivisionSlug(slug: string): slug is DivisionSlug {
  return (DIVISION_SLUGS as readonly string[]).includes(slug);
}

/** The page for a route parameter, or `undefined` for an unknown or not yet built slug. */
export function getDivisionPage(slug: string): DivisionPageContent | undefined {
  return isDivisionSlug(slug) ? DIVISION_PAGES[slug] : undefined;
}

/** Slugs of the built pages, in the site's division order. */
export function builtDivisionSlugs(): DivisionSlug[] {
  return DIVISION_SLUGS.filter((slug) => DIVISION_PAGES[slug] !== undefined);
}

/**
 * The `/divisions/{slug}` resource of a built page: the authored page with its blocks in render
 * order, the closing "Explore our divisions" grid included (`divisionPageBlocks`).
 */
export function divisionPageResource(slug: string): DivisionPage | undefined {
  const page = getDivisionPage(slug);
  return page && { ...page, blocks: divisionPageBlocks(page) };
}
