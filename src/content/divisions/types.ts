import type { ContentBlock, PageHeroContent } from "@/content/blocks";
import type { DivisionSlug } from "@/lib/routes";

/**
 * Content of a division page (`/divisions/[slug]`, original `#p-div-<slug>`, docs/analysis/04 §3):
 * the shared `.kh-hero` banner, then 5–7 generic blocks. The closing "Explore our divisions" grid
 * of the other four divisions is not authored: `divisionPageBlocks` appends it, so a page can
 * never list itself. Division pages have no contact section; their "go to contact" CTAs open
 * Start-a-Project with the division's service (`SERVICE_FOR_PAGE`).
 *
 * Plain data, so Laravel can serve the same shape later.
 */
export type DivisionPageContent = {
  readonly slug: DivisionSlug;
  /** The original's `data-title` (already ends in the division name) and `data-desc`. */
  readonly seo: { readonly title: string; readonly description: string };
  readonly hero: PageHeroContent;
  /** The page's blocks after the hero, without the closing divisions grid. */
  readonly blocks: readonly ContentBlock[];
};
