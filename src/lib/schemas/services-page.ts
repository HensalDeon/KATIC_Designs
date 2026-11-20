import { z } from "zod";

import { processStepSchema } from "./blocks";
import { relatedServiceSlugSchema } from "./entities";
import { hrefSchema, list, mediaIdSchema, serviceIconSchema, toneSchema } from "./primitives";

/**
 * The services overview (`GET /pages/services`, `#p-services`, docs/analysis/02 §3). Service
 * names, descriptions and links are not restated: each block names its service by slug and the
 * page resolves it from the related-service cards (`listRelatedServices()`).
 */

const linkSchema = z.object({ label: z.string(), href: hrefSchema });

/** A photo with its alt text and the small caption chip (`.lab`) over it. */
export const labelledPhotoSchema = z.object({
  src: mediaIdSchema,
  alt: z.string(),
  label: z.string(),
});
export type LabelledPhoto = z.infer<typeof labelledPhotoSchema>;

/** The banner (`#p-services .hero`) with its side index of services (`.wd`). */
export const servicesHeroSchema = z.object({
  image: z.object({ src: mediaIdSchema, alt: z.string() }),
  kicker: z.string(),
  /** Title lines; the accent follows as the orange last line (`.or`). */
  titleLines: list(z.string()),
  accent: z.string(),
  lead: z.string(),
  cta: linkSchema,
  /** Heading of the side index of services (`.wd small`). */
  indexLabel: z.string(),
});
export type ServicesHeroContent = z.infer<typeof servicesHeroSchema>;

/** "What we do" (`section.pp-host.wd2`). */
export const whatWeDoSchema = z.object({
  kicker: z.string(),
  title: z.string(),
  /** Large statement under the title (`.sub`). */
  statement: z.string(),
  lead: z.string(),
  body: z.string(),
  cta: linkSchema,
  steps: list(processStepSchema),
});
export type WhatWeDoContent = z.infer<typeof whatWeDoSchema>;

/** "What we deliver" (`section.fd`). */
export const whatWeDeliverSchema = z.object({
  kicker: z.string(),
  titleLines: list(z.string()),
  lead: z.string(),
});
export type WhatWeDeliverContent = z.infer<typeof whatWeDeliverSchema>;

/**
 * One service block (`section.blk`). `tone` is the colour the original actually renders, not its
 * class name; `contrast: "high"` is its `.d` palette (stronger text, a 30% hairline and the button
 * in the opposite tone).
 */
export const serviceBlockSchema = z.object({
  /** The service, by its card (`listRelatedServices()`): name, description and page. */
  slug: relatedServiceSlugSchema,
  tone: toneSchema,
  contrast: z.enum(["standard", "high"]),
  /** Images on the left, text on the right (`.rev`). */
  reverse: z.boolean(),
  icon: serviceIconSchema,
  /** Small caps line in the block header and on the main photo (`.hd`, `.big .lab`). */
  tagline: z.string(),
  ctaLabel: z.string(),
  image: labelledPhotoSchema,
  thumbnails: z
    .tuple([labelledPhotoSchema, labelledPhotoSchema, labelledPhotoSchema, labelledPhotoSchema])
    .readonly(),
});
export type ServiceBlockContent = z.infer<typeof serviceBlockSchema>;

/** The `/pages/services` resource, in page order. */
export const servicesPageSchema = z.object({
  /** The original's `data-title` (already ends in the brand) and `data-desc`. */
  seo: z.object({ title: z.string(), description: z.string() }),
  hero: servicesHeroSchema,
  whatWeDo: whatWeDoSchema,
  /** The service blocks, in page order; the hero's index lists the same services. */
  blocks: list(serviceBlockSchema),
  whatWeDeliver: whatWeDeliverSchema,
});
export type ServicesPage = z.infer<typeof servicesPageSchema>;
