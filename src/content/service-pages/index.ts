import { SERVICE_SLUGS, type ServiceSlug } from "@/lib/routes";

import { INTERIOR_PAGE } from "./interior";
import { TURNKEY_PAGE } from "./turnkey";
import type { ServicePageContent } from "./types";

export type * from "./types";

/**
 * Registry of the service detail pages (`/services/[slug]`). A page is built when it has an entry;
 * `/services/[slug]` prerenders exactly these and answers 404 for the rest. To add a page, import
 * its `<slug>.ts` and replace its `undefined`.
 */
export const SERVICE_PAGES: Readonly<Record<ServiceSlug, ServicePageContent | undefined>> = {
  architecture: undefined,
  interior: INTERIOR_PAGE,
  factory: undefined,
  construction: undefined,
  turnkey: TURNKEY_PAGE,
  renovation: undefined,
  exterior: undefined,
  "property-care": undefined,
};

function isServiceSlug(slug: string): slug is ServiceSlug {
  return (SERVICE_SLUGS as readonly string[]).includes(slug);
}

/** The page for a route parameter, or `undefined` for an unknown or not yet built slug. */
export function getServicePage(slug: string): ServicePageContent | undefined {
  return isServiceSlug(slug) ? SERVICE_PAGES[slug] : undefined;
}

/** Slugs of the built pages, in the site's service order. */
export function builtServiceSlugs(): ServiceSlug[] {
  return SERVICE_SLUGS.filter((slug) => SERVICE_PAGES[slug] !== undefined);
}
