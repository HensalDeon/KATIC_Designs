import { INDIA_AREAS, type IndiaArea, routes } from "@/lib/routes";

/**
 * Filter state of India's project grid (`#p-india #india-projects`, `.kcats[data-filter="india"]`).
 * Pure, so the rules are unit-tested (india-filter.test.ts) and shared by the server and client
 * render.
 */

/** An India filter: an area or every project. */
export type IndiaFilterValue = IndiaArea | "all";

/** Query parameter holding the filter (`/locations/india?area=kochi#india-projects`). */
export const INDIA_FILTER_PARAM = "area";

/**
 * The filter named by an `?area=` value. Missing, empty and unknown values show every project, like
 * the original's `#india/india-projects/<f>` router (JS 4744).
 */
export function parseIndiaArea(value: string | null | undefined): IndiaFilterValue {
  return (INDIA_AREAS as readonly string[]).includes(value ?? "") ? (value as IndiaArea) : "all";
}

/** Shareable URL of a filter state; it lands on the project grid. */
export function indiaFilterHref(filter: IndiaFilterValue): string {
  return routes.indiaProjects(filter === "all" ? undefined : filter);
}

/** Whether a card of `area` shows under `filter`. */
export function inIndiaFilter(area: IndiaArea, filter: IndiaFilterValue): boolean {
  return filter === "all" || area === filter;
}
