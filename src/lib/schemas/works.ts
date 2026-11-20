import { z } from "zod";

import { projectSlugSchema, sectorKeySchema } from "./entities";
import {
  ctaBandCallSchema,
  divisionSlugSchema,
  linkSchema,
  list,
  pageSeoSchema,
  richTextSchema,
  sectionImageSchema,
  serviceIconSchema,
  serviceSlugSchema,
  titleLineSchema,
  worksCategorySchema,
} from "./primitives";

/**
 * The Works listing (`GET /pages/works`, original `#p-works` lines 3604–3781, docs/analysis/04 §1):
 * every section's copy. Project cards, sector tiles and division cards are references by slug or
 * key (D6/KI-D01), resolved through the shared collections (`getRefs()`), never restated here.
 */

const displayTitleSchema = list(titleLineSchema);

/** Banner (`#p-works .hero`). */
export const worksHeroSchema = z.object({
  image: sectionImageSchema,
  kicker: z.string(),
  title: displayTitleSchema,
  lead: z.string(),
  cta: linkSchema,
  /**
   * The "current project" note at the right of the canvas (`a.cur`, hidden below 1100px). It links
   * to `project`; the label and meta are printed as the original renders them.
   */
  current: z.object({ project: projectSlugSchema, label: z.string(), meta: z.string() }),
});
export type WorksHeroContent = z.infer<typeof worksHeroSchema>;

/** "Featured projects" (`section.ft1`). */
export const worksFeaturedSchema = z.object({
  kicker: z.string(),
  title: displayTitleSchema,
  text: z.string(),
  /** The project the feature opens (`a.im` and "View Project"). */
  project: projectSlugSchema,
  /** Name printed over the photo. */
  name: z.string(),
  image: sectionImageSchema,
  /** Dark tag at the top left of the photo (`.tag`). */
  tag: z.string(),
  /** Orange reference at the bottom right of the photo (`em`). */
  code: z.string(),
  /** Uppercase crumb, separated by orange slashes (`.crumb`). */
  crumb: list(z.string()),
  heading: z.string(),
  description: z.string(),
  cta: z.string(),
  /** The three figures under a rule (`.sts`). */
  stats: list(z.object({ value: z.string(), label: z.string() })),
});
export type WorksFeaturedContent = z.infer<typeof worksFeaturedSchema>;

/** "Project categories" (`section.ks.dk`). */
export const worksSectorsSchema = z.object({
  kicker: z.string(),
  title: displayTitleSchema,
  lead: z.string(),
  /** Sector tiles (`.ksec`), each opening the portfolio filtered by its sector. */
  sectors: list(sectorKeySchema),
});
export type WorksSectorsContent = z.infer<typeof worksSectorsSchema>;

/** A portfolio filter button: a category, or `"all"` for every project. */
export const worksFilterSchema = z.object({
  label: z.string(),
  category: z.union([worksCategorySchema, z.literal("all")]),
});
export type WorksFilter = z.infer<typeof worksFilterSchema>;

/** The filterable portfolio (`section.sw#works-list`). */
export const worksPortfolioSchema = z.object({
  kicker: z.string(),
  title: displayTitleSchema,
  text: z.string(),
  /** Filter buttons (`.fl button`), in the original order. */
  filters: list(worksFilterSchema),
  /** Accessible name of the filter group. */
  filtersLabel: z.string(),
  /** Cards in the original order (`.pj`). */
  projects: list(projectSlugSchema),
  /** Card link label (`.v`; the arrow is drawn by the component). */
  cardLinkLabel: z.string(),
});
export type WorksPortfolioContent = z.infer<typeof worksPortfolioSchema>;

/** "Selected case study" (`section.pp-host.ks.dk`). */
export const worksCaseStudySchema = z.object({
  project: projectSlugSchema,
  image: sectionImageSchema,
  caption: z.string(),
  kicker: z.string(),
  title: displayTitleSchema,
  lead: z.string(),
  body: richTextSchema,
  facts: list(z.string()),
  cta: z.string(),
});
export type WorksCaseStudyContent = z.infer<typeof worksCaseStudySchema>;

/** A service card of "Our capabilities". */
export const worksCapabilitySchema = z.object({
  service: serviceSlugSchema,
  title: z.string(),
  text: z.string(),
  image: sectionImageSchema,
  icon: serviceIconSchema,
});
export type WorksCapability = z.infer<typeof worksCapabilitySchema>;

/** "Our capabilities" (`section.xp`). */
export const worksCapabilitiesSchema = z.object({
  kicker: z.string(),
  title: displayTitleSchema,
  text: z.string(),
  cards: list(worksCapabilitySchema),
  cardLinkLabel: z.string(),
});
export type WorksCapabilitiesContent = z.infer<typeof worksCapabilitiesSchema>;

/** "Explore divisions" (`section.ks.dk`): the division cards by slug. */
export const worksDivisionsSchema = z.object({
  kicker: z.string(),
  title: displayTitleSchema,
  divisions: list(divisionSlugSchema),
});
export type WorksDivisionsContent = z.infer<typeof worksDivisionsSchema>;

/** "Start a project" (`section.ctasec`). */
export const worksCtaSchema = z.object({
  image: sectionImageSchema,
  kicker: z.string(),
  title: displayTitleSchema,
  text: z.string(),
  cta: linkSchema,
  call: ctaBandCallSchema,
});
export type WorksCtaContent = z.infer<typeof worksCtaSchema>;

/** The `/pages/works` resource. */
export const worksPageSchema = z.object({
  seo: pageSeoSchema,
  hero: worksHeroSchema,
  featured: worksFeaturedSchema,
  sectors: worksSectorsSchema,
  portfolio: worksPortfolioSchema,
  caseStudy: worksCaseStudySchema,
  capabilities: worksCapabilitiesSchema,
  divisions: worksDivisionsSchema,
  cta: worksCtaSchema,
});
export type WorksPageContent = z.infer<typeof worksPageSchema>;
