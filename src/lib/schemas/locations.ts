import { z } from "zod";

import type { DubaiContextContent } from "@/components/locations/dubai/dubai-context";
import type { DubaiHeroContent } from "@/components/locations/dubai/dubai-hero";
import type { DubaiOfficeContent } from "@/components/locations/dubai/dubai-office";
import type { DubaiProjectsContent } from "@/components/locations/dubai/dubai-projects";

import {
  blockBaseShape,
  contactTemplateSchema,
  contentBlockSchema,
  pageHeroSchema,
} from "./blocks";
import { projectSlugSchema } from "./entities";
import {
  accentTitleSchema,
  hrefSchema,
  indiaAreaSchema,
  linkSchema,
  list,
  pageSeoSchema,
  sectionActionSchema,
  sectionHeaderSchema,
  sectionImageSchema,
  shaped,
  titleLinesSchema,
} from "./primitives";

/**
 * The location pages (`GET /locations/{slug}`): India (`/locations/india`, original `#p-india`,
 * docs/analysis/04 §7) and Dubai (`/locations/dubai`, `#p-dubai`, §8). Each is a banner, an ordered
 * list of blocks (the generic `ContentBlock`s plus the page's own) and its contact section.
 */

/** A page's contact section: the CONTACT template with the page's copy, under its own id. */
const locationContactSchema = contactTemplateSchema.extend({
  /** `<page>-contact`, as the original renames the section at runtime (JS 4776). */
  id: z.string().min(1),
});

// ---------------------------------------------------------------------------------------------
// India
// ---------------------------------------------------------------------------------------------

/** A filter button (`.kcats button`, `data-f`). */
export const indiaFilterSchema = z.object({
  value: z.union([indiaAreaSchema, z.literal("all")]),
  label: z.string(),
});
export type IndiaFilter = z.infer<typeof indiaFilterSchema>;

/** A project card of the filterable grid: the project by slug, its card meta and its area. */
export const indiaProjectCardSchema = z.object({
  project: projectSlugSchema,
  /** The small orange line, verbatim ("Residential · Architecture · Panampilly Nagar, Kochi"). */
  meta: z.string(),
  /**
   * Kochi or the rest of Kerala (the original's `data-cat`). Page data rather than a project field:
   * it is how this page groups its cards, and the project already has `region` and `location`; a
   * unit test keeps the two consistent (india.test.ts).
   */
  area: indiaAreaSchema,
});
export type IndiaProjectCard = z.infer<typeof indiaProjectCardSchema>;

/** `#india-projects` (`section.ks` with `.kcats[data-filter="india"]`): page-specific block. */
export const indiaProjectsBlockSchema = z.object({
  ...blockBaseShape,
  type: z.literal("indiaProjects"),
  id: z.string().min(1),
  header: sectionHeaderSchema,
  /** Accessible name of the filter group. */
  filtersLabel: z.string(),
  filters: list(indiaFilterSchema),
  items: list(indiaProjectCardSchema),
});
export type IndiaProjectsBlock = z.infer<typeof indiaProjectsBlockSchema>;

export const indiaBlockSchema = z.union([contentBlockSchema, indiaProjectsBlockSchema]);
export type IndiaBlock = z.infer<typeof indiaBlockSchema>;

/** The `/locations/india` resource. */
export const indiaPageSchema = z.object({
  /** The original's `data-title` (already ends in the brand) and `data-desc`. */
  seo: pageSeoSchema,
  hero: pageHeroSchema,
  /** Tones alternate from white after the hero; the contact takes the opposite of the last. */
  blocks: list(indiaBlockSchema),
  /** The CONTACT template with India's copy and extra selects (`section.contact[data-src=india]`). */
  contact: locationContactSchema,
});
export type IndiaPageContent = z.infer<typeof indiaPageSchema>;

// ---------------------------------------------------------------------------------------------
// Dubai
// ---------------------------------------------------------------------------------------------

/** Banner (`#p-dubai .hero`): see `DubaiHero`. */
export const dubaiHeroSchema = shaped<DubaiHeroContent>()(
  z.object({
    image: sectionImageSchema,
    kicker: z.string(),
    title: accentTitleSchema,
    lead: z.string(),
    primaryCta: sectionActionSchema,
    secondaryCta: sectionActionSchema,
    bar: z.object({ label: z.string(), scroll: linkSchema }),
  }),
);

/** "KATIC in Dubai" (`section.s1#dubai-context`): see `DubaiContext`. */
export const dubaiContextSchema = shaped<DubaiContextContent>()(
  z.object({
    image: sectionImageSchema,
    caption: z.tuple([z.string(), z.string()]).readonly(),
    kicker: z.string(),
    title: titleLinesSchema,
    body: z.string(),
    cta: linkSchema,
  }),
);

/** Office and contact details (`section.ks#dubai-office .koff`): see `DubaiOffice`. */
export const dubaiOfficeSchema = shaped<DubaiOfficeContent>()(
  z.object({
    kicker: z.string(),
    title: titleLinesSchema,
    details: list(
      z.object({
        term: z.string(),
        value: z.string(),
        href: hrefSchema.exactOptional(),
        note: z.string().exactOptional(),
      }),
    ),
    directions: linkSchema,
    image: sectionImageSchema,
  }),
);

const mosaicCardSchema = z.object({
  project: projectSlugSchema,
  label: z.string(),
  scope: z.string(),
});

/** Project mosaic (`section.s5`): see `DubaiProjects`. */
export const dubaiProjectsSchema = shaped<DubaiProjectsContent>()(
  z.object({
    kicker: z.string(),
    title: titleLinesSchema,
    body: z.string(),
    rows: list(
      z.object({
        layout: z.enum(["wide-first", "narrow-first"]),
        cards: z.tuple([mosaicCardSchema, mosaicCardSchema]).readonly(),
      }),
    ),
    cta: linkSchema,
  }),
);

export const dubaiContextBlockSchema = dubaiContextSchema.extend({
  ...blockBaseShape,
  type: z.literal("dubaiContext"),
});
export type DubaiContextBlock = z.infer<typeof dubaiContextBlockSchema>;

export const dubaiOfficeBlockSchema = dubaiOfficeSchema.extend({
  ...blockBaseShape,
  type: z.literal("dubaiOffice"),
});
export type DubaiOfficeBlock = z.infer<typeof dubaiOfficeBlockSchema>;

export const dubaiProjectsBlockSchema = dubaiProjectsSchema.extend({
  ...blockBaseShape,
  type: z.literal("dubaiProjects"),
});
export type DubaiProjectsBlock = z.infer<typeof dubaiProjectsBlockSchema>;

/** Every block the Dubai page can render, in the shared stack (`BlockStack`). */
export const dubaiBlockSchema = z.union([
  contentBlockSchema,
  dubaiContextBlockSchema,
  dubaiOfficeBlockSchema,
  dubaiProjectsBlockSchema,
]);
export type DubaiBlock = z.infer<typeof dubaiBlockSchema>;

export type DubaiSeo = z.infer<typeof pageSeoSchema>;

/** The `/locations/dubai` resource. */
export const dubaiPageSchema = z.object({
  /** `data-title` / `data-desc` of `#p-dubai` (the title already ends in the brand). */
  seo: pageSeoSchema,
  hero: dubaiHeroSchema,
  /** In the original's order; tones alternate from white after the hero. */
  blocks: list(dubaiBlockSchema),
  /**
   * The page's own contact section (`section.contact[data-src=dubai]`): its own heading, WhatsApp
   * in the channels, and Project Location before Project Type (the reverse of India).
   */
  contact: locationContactSchema,
});
export type DubaiPageContent = z.infer<typeof dubaiPageSchema>;
