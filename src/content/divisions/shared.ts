import type { SectionImage } from "@/components/sections/section-image";
import type { ContentBlock, DivisionCardsBlock, PageHeroContent } from "@/content/blocks";
import { SERVICE_FOR_PAGE } from "@/content/services";
import { type DivisionSlug, routes } from "@/lib/routes";

import { DIVISIONS, otherDivisions } from ".";
import type { DivisionPageContent } from "./types";

/**
 * Copy and structure every division page shares (reference/original/katic-designs-final.stripped.html
 * 3978–4047; docs/analysis/04 §3, "What every division page shares").
 */

/** "Explore our divisions" header, identical on all five pages. */
export const EXPLORE_DIVISIONS_HEADER = {
  kicker: "Explore our divisions",
  title: ["One vision.", "Five divisions."],
} as const;

/** The closing `.kc-grid.c4` of the four other divisions ("Explore Division"). */
export function exploreDivisionsBlock(slug: DivisionSlug): DivisionCardsBlock {
  return {
    type: "divisionCards",
    header: EXPLORE_DIVISIONS_HEADER,
    columns: 4,
    divisions: otherDivisions(slug),
  };
}

/** A division page's blocks in render order: its own blocks, then the other divisions. */
export function divisionPageBlocks(content: DivisionPageContent): readonly ContentBlock[] {
  return [...content.blocks, exploreDivisionsBlock(content.slug)];
}

/**
 * The shared `.kh-hero` banner: kicker "KATIC Divisions · KATIC X", title "KATIC <X>", the page's
 * lead, "Start a Project" and "View Projects" (`#works/works-list`).
 *
 * "Start a Project" is the original's `data-go="contact"`. A division page has no contact section,
 * so the original sends the visitor to the home page's form with the division's `PREFILL` service;
 * here it opens the Start-a-Project popup with that service instead, keeping the visitor on the
 * page (Developers has no service, as in the original).
 */
export function divisionHero(
  slug: DivisionSlug,
  { image, lead }: { readonly image: SectionImage; readonly lead: string },
): PageHeroContent {
  const division = DIVISIONS[slug];
  const service = SERVICE_FOR_PAGE[`div-${slug}`];
  return {
    image,
    kicker: `KATIC Divisions · ${division.name}`,
    title: { lines: ["KATIC"], accent: division.accent },
    lead,
    primaryCta: { kind: "enquiry", label: "Start a Project", ...(service ? { service } : {}) },
    secondaryCta: { kind: "link", label: "View Projects", href: `${routes.works}#works-list` },
  };
}
