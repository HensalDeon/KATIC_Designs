import { z } from "zod";

import { projectSlugSchema, testimonialIdSchema } from "./entities";
import {
  accentTitleSchema,
  linkSchema,
  list,
  pageSeoSchema,
  sectionImageSchema,
  serviceIconSchema,
  serviceSlugSchema,
  titleLinesSchema,
} from "./primitives";

/**
 * Reviews (`GET /pages/reviews`; `#p-reviews`, original lines 4216–4379, docs/analysis/04 §9): the
 * copy of every section. Testimonials and project cards are referenced by id (D6) and resolved
 * from `/testimonials` and `/projects` (`getRefs()`).
 */

/** `.hero` (4287–4295). */
export const reviewsHeroSchema = z.object({
  image: sectionImageSchema,
  kicker: z.string(),
  title: accentTitleSchema,
  lead: z.string(),
  cta: linkSchema,
});
export type ReviewsHeroContent = z.infer<typeof reviewsHeroSchema>;

/** `section.tr` (4297–4307). */
export const reviewsTrustSchema = z.object({
  kicker: z.string(),
  title: titleLinesSchema,
  text: z.string(),
  cta: linkSchema,
  image: sectionImageSchema,
  /** The dark caption box over the photo (`.bx`). */
  caption: z.object({ label: z.string(), text: z.string() }),
});
export type ReviewsTrustContent = z.infer<typeof reviewsTrustSchema>;

/** `section.cl` (4309–4323): testimonials from the shared pool, in the original's order. */
export const reviewsClientsSchema = z.object({
  kicker: z.string(),
  title: titleLinesSchema,
  text: z.string(),
  testimonials: list(testimonialIdSchema),
  note: z.string(),
  cta: linkSchema,
});
export type ReviewsClientsContent = z.infer<typeof reviewsClientsSchema>;

/** A discipline card of `section.xp`, opening its service page. */
export const reviewsExpertiseCardSchema = z.object({
  service: serviceSlugSchema,
  title: z.string(),
  text: z.string(),
  icon: serviceIconSchema,
  image: sectionImageSchema,
});
export type ReviewsExpertiseCard = z.infer<typeof reviewsExpertiseCardSchema>;

/** `section.xp` (4324–4334). */
export const reviewsExpertiseSchema = z.object({
  kicker: z.string(),
  title: titleLinesSchema,
  cta: linkSchema,
  cards: list(reviewsExpertiseCardSchema),
});
export type ReviewsExpertiseContent = z.infer<typeof reviewsExpertiseSchema>;

/** An icon row of the featured story. */
export const reviewsStoryRowSchema = z.object({
  icon: serviceIconSchema,
  title: z.string(),
  text: z.string(),
});
export type ReviewsStoryRow = z.infer<typeof reviewsStoryRowSchema>;

/** `section.pp-host.bb` (4336–4352): the featured story. */
export const reviewsStorySchema = z.object({
  kicker: z.string(),
  title: titleLinesSchema,
  /** Right-aligned uppercase facts beside the title (`.rt`). */
  facts: list(z.string()),
  /** The large photo, then the three thumbnails (`.big`, `.th`); all open the lightbox. */
  images: z
    .tuple([sectionImageSchema, sectionImageSchema, sectionImageSchema, sectionImageSchema])
    .readonly(),
  /** Includes the original's curly quotes. */
  quote: z.string(),
  attribution: z.string(),
  rows: list(reviewsStoryRowSchema),
  cta: linkSchema,
});
export type ReviewsStoryContent = z.infer<typeof reviewsStorySchema>;

/** `section.sp` (4353–4366): project cards by slug. */
export const reviewsProjectsSchema = z.object({
  kicker: z.string(),
  title: titleLinesSchema,
  text: z.string(),
  cta: linkSchema,
  projects: list(projectSlugSchema),
});
export type ReviewsProjectsContent = z.infer<typeof reviewsProjectsSchema>;

/** `section.ctasec` (4368–4376). */
export const reviewsCtaSchema = z.object({
  image: sectionImageSchema,
  kicker: z.string(),
  title: titleLinesSchema,
  text: z.string(),
  cta: linkSchema,
});
export type ReviewsCtaContent = z.infer<typeof reviewsCtaSchema>;

/** The `/pages/reviews` resource. */
export const reviewsPageSchema = z.object({
  /** The original's `data-title` (already ends in the brand) and `data-desc`. */
  seo: pageSeoSchema,
  hero: reviewsHeroSchema,
  trust: reviewsTrustSchema,
  clients: reviewsClientsSchema,
  expertise: reviewsExpertiseSchema,
  story: reviewsStorySchema,
  projects: reviewsProjectsSchema,
  cta: reviewsCtaSchema,
});
export type ReviewsPageContent = z.infer<typeof reviewsPageSchema>;
