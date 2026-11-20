import { z } from "zod";

import { projectSlugSchema } from "./entities";
import {
  linkSchema,
  list,
  pageSeoSchema,
  sectionImageSchema,
  serviceIconSchema,
  titleLinesSchema,
} from "./primitives";

/**
 * Project detail pages (`GET /projects/{slug}`, `/works/[slug]`, original `#p-project`,
 * docs/analysis/04 §2). One `ProjectDetail` per built page, rendered by
 * `src/components/project/project-page.tsx`.
 *
 * The detail never restates what the shared `Project` entity already holds: the name, cover, type
 * and related projects' cards come from there by slug (`getRefs()`). What lives here is the page's
 * own copy and photography.
 *
 * ## Page anatomy (fixed order, tones as rendered by the original)
 *
 * hero (dark) → overview (light) → design response (dark) → brief (light) → materials (dark) →
 * gallery (light, `#project-gallery`) → related projects (dark) → call to action (dark band).
 */

/** A plain internal link rendered as a button (`.btn.cap`). */
export const projectLinkSchema = linkSchema;
export type ProjectLink = z.infer<typeof projectLinkSchema>;

/** Kicker and title of a section's left column (`.two > div:first-child`). */
const sectionHeadingShape = { kicker: z.string(), title: titleLinesSchema };
export const projectSectionHeadingSchema = z.object(sectionHeadingShape);
export type ProjectSectionHeading = z.infer<typeof projectSectionHeadingSchema>;

/** Banner (`#p-project .hero`). The title is the project's name, split for its orange last word. */
export const projectHeroSchema = z.object({
  image: sectionImageSchema,
  /** CSS `object-position` of the banner photo (the original's inline `center 60%`). */
  objectPosition: z.string().exactOptional(),
  /** The name as printed: plain lines, then the orange accent on its own line. */
  title: z.object({ lines: titleLinesSchema, accent: z.string() }),
  /** `.loc` under the title. Page-specific (KI-D01, see `ProjectDetail`). */
  location: z.string(),
  /** "VIEW GALLERY": scrolls to the gallery section. */
  galleryLabel: z.string(),
  /** `.yr` at the bottom centre ("RESIDENTIAL ARCHITECTURE · 2025"). */
  sectorLine: z.string(),
});
export type ProjectHeroContent = z.infer<typeof projectHeroSchema>;

/** One fact of the overview's five-column strip (`.facts`). */
export const projectFactSchema = z.object({ label: z.string(), value: z.string() });
export type ProjectFact = z.infer<typeof projectFactSchema>;

/** `section.ov`: overview with facts, two photos and a service link. */
export const projectOverviewSchema = z.object({
  ...sectionHeadingShape,
  intro: z.string(),
  facts: list(projectFactSchema),
  /** Large photo (`.a`, 820px column) and small photo (`.b`, beside it). */
  images: z.tuple([sectionImageSchema, sectionImageSchema]).readonly(),
  /** Short line beside the button (`.cap span`). */
  caption: z.string(),
  cta: projectLinkSchema,
});
export type ProjectOverviewContent = z.infer<typeof projectOverviewSchema>;

/** One of the three principles under the design response (`.pts`). */
export const projectPointSchema = z.object({
  icon: serviceIconSchema,
  title: z.string(),
  text: z.string(),
});
export type ProjectPoint = z.infer<typeof projectPointSchema>;

/** `section.dr`: design response. */
export const projectDesignResponseSchema = z.object({
  ...sectionHeadingShape,
  paragraphs: list(z.string()),
  /** Tall photo on the left of the plan block (`.g .a`). */
  mainImage: sectionImageSchema,
  /** Planning block beside it: kicker, h3, paragraph and a small photo. */
  planning: z.object({
    kicker: z.string(),
    title: z.string(),
    text: z.string(),
    image: sectionImageSchema,
  }),
  points: list(projectPointSchema),
  /** Closing statement (`.stm p`) beside its button. */
  statement: z.string(),
  cta: projectLinkSchema,
});
export type ProjectDesignResponseContent = z.infer<typeof projectDesignResponseSchema>;

/** A photo with its height on the 1440 canvas (the original's inline `height`). */
export const projectPhotoSchema = z.object({
  image: sectionImageSchema,
  height: z.number().positive(),
  /** Uppercase label under the photo, if any. */
  caption: z.string().exactOptional(),
});
export type ProjectPhoto = z.infer<typeof projectPhotoSchema>;

const photoPairSchema = z.tuple([projectPhotoSchema, projectPhotoSchema]).readonly();

/** `section.br`: the brief. */
export const projectBriefSchema = z.object({
  ...sectionHeadingShape,
  paragraphs: list(z.string()),
  /** The bold closing line (`.bold`). */
  objective: z.string(),
  images: photoPairSchema,
});
export type ProjectBriefContent = z.infer<typeof projectBriefSchema>;

/** One material of the palette strip (`.mats`). */
export const projectMaterialSchema = z.object({
  name: z.string(),
  /** Swatch colour (CSS colour). */
  swatch: z.string(),
  text: z.string(),
});
export type ProjectMaterial = z.infer<typeof projectMaterialSchema>;

/** `section.mt`: architecture, interiors and materials. */
export const projectMaterialsSchema = z.object({
  ...sectionHeadingShape,
  paragraphs: list(z.string()),
  images: photoPairSchema,
  materials: list(projectMaterialSchema),
  statement: z.string(),
  cta: projectLinkSchema,
});
export type ProjectMaterialsContent = z.infer<typeof projectMaterialsSchema>;

/**
 * Column layout of a gallery row, as the original's inline `grid-template-columns`:
 * `full` = `1fr`, `wide-narrow` = `760px 1fr`, `narrow-wide` = `488px 1fr`, `thirds` = `repeat(3,1fr)`.
 */
export const projectGalleryRowLayoutSchema = z.enum([
  "full",
  "wide-narrow",
  "narrow-wide",
  "thirds",
]);
export type ProjectGalleryRowLayout = z.infer<typeof projectGalleryRowLayoutSchema>;

export const projectGalleryRowSchema = z.object({
  layout: projectGalleryRowLayoutSchema,
  /** Every photo has a caption (`figcaption`). */
  photos: list(projectPhotoSchema.extend({ caption: z.string() })),
});
export type ProjectGalleryRow = z.infer<typeof projectGalleryRowSchema>;

/** `section.gl#project-gallery`. */
export const projectGallerySchema = z.object({
  ...sectionHeadingShape,
  /** `.vw` at the bottom right of the header ("10 VIEWS · KAKKANAD, KOCHI"). */
  viewsLabel: z.string(),
  rows: list(projectGalleryRowSchema),
});
export type ProjectGalleryContent = z.infer<typeof projectGallerySchema>;

/**
 * A related project card. The card's name, photo and link come from the `Project`; `meta` is the
 * label the original prints on this page's card ("RESIDENTIAL · THRIPPUNITHURA"), which mixes the
 * type, the scope and a short location and so cannot be derived consistently.
 */
export const projectRelatedCardSchema = z.object({ project: projectSlugSchema, meta: z.string() });
export type ProjectRelatedCard = z.infer<typeof projectRelatedCardSchema>;

/** `section.rl`: related projects. */
export const projectRelatedSchema = z.object({
  ...sectionHeadingShape,
  lead: z.string(),
  projects: list(projectRelatedCardSchema),
  /** Label of each card's link line ("VIEW PROJECT"). */
  moreLabel: z.string(),
});
export type ProjectRelatedContent = z.infer<typeof projectRelatedSchema>;

/** `section.ctasec`: the closing call to action. */
export const projectCtaSchema = z.object({
  image: sectionImageSchema,
  kicker: z.string(),
  title: titleLinesSchema,
  text: z.string(),
  /** Goes to the enquiry form (the original `data-go="contact"`). */
  label: z.string(),
});
export type ProjectCtaContent = z.infer<typeof projectCtaSchema>;

/**
 * A project detail page. Facts printed on the page that disagree with the shared `Project`
 * (e.g. The Courtyard House's location, KI-D01) are page copy here and do not change the `Project`.
 */
export const projectDetailSchema = z.object({
  /** The project this page describes (name and cards come from the `Project` entity). */
  slug: projectSlugSchema,
  /** The original's `data-title` / `data-desc`. */
  seo: pageSeoSchema,
  hero: projectHeroSchema,
  overview: projectOverviewSchema,
  designResponse: projectDesignResponseSchema,
  brief: projectBriefSchema,
  materials: projectMaterialsSchema,
  gallery: projectGallerySchema,
  related: projectRelatedSchema,
  cta: projectCtaSchema,
});
export type ProjectDetail = z.infer<typeof projectDetailSchema>;
