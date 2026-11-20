import { z } from "zod";

import { contentBlockSchema, pageHeroSchema } from "./blocks";
import { divisionSlugSchema, list, pageSeoSchema } from "./primitives";

/**
 * Division pages (`GET /divisions/{slug}`; `#p-div-<slug>`, docs/analysis/04 §3): the shared
 * `.kh-hero` banner, then the page's generic blocks in render order, ending with the closing
 * "Explore our divisions" grid of the other four divisions. Division pages have no contact
 * section.
 */
export const divisionPageSchema = z.object({
  slug: divisionSlugSchema,
  /** The original's `data-title` (already ends in the division name) and `data-desc`. */
  seo: pageSeoSchema,
  hero: pageHeroSchema,
  /** Every block after the hero, including the closing divisions grid. */
  blocks: list(contentBlockSchema),
});
export type DivisionPage = z.infer<typeof divisionPageSchema>;
