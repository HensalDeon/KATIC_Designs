import { z } from "zod";

import { PROCESS_STAGE_IDS } from "@/content/process-stages";
import { PROJECT_SLUGS, PROJECT_TYPE_CATEGORY, type ProjectType } from "@/content/projects";
import { SECTOR_KEYS } from "@/content/sectors";
import { TESTIMONIAL_IDS } from "@/content/testimonials";
import { SERVICE_SLUGS } from "@/lib/routes";

import {
  divisionSlugSchema,
  hrefSchema,
  list,
  mediaIdSchema,
  oneOf,
  serviceIconSchema,
  worksCategorySchema,
} from "./primitives";

/**
 * The shared entities (D6): one record per thing, referenced by id or slug from every page that
 * shows it, never restated. Each is a collection resource of the API (`/projects`,
 * `/testimonials`, …) and its type is `z.infer` of the schema here.
 */

// ---------------------------------------------------------------------------------------------
// Projects (`GET /projects?category=`, `GET /projects/{slug}`)
// ---------------------------------------------------------------------------------------------

export const projectSlugSchema = oneOf(PROJECT_SLUGS);
export const projectTypeSchema = oneOf(Object.keys(PROJECT_TYPE_CATEGORY) as ProjectType[]);
export const projectRegionSchema = z.enum(["kerala", "uae", "north-macedonia"]);

export const projectSchema = z.object({
  slug: z.string().min(1),
  name: z.string(),
  /** As printed on cards, e.g. "Thrissur, Kerala". */
  location: z.string(),
  region: projectRegionSchema,
  /** Filter categories (`data-cat`). */
  categories: list(worksCategorySchema),
  /** Pill label. */
  type: projectTypeSchema,
  /** What we delivered, as printed after the location ("Architecture", "Turnkey", …). */
  scope: z.string(),
  year: z.number().int().exactOptional(),
  /** Cover image (`.sc-card img`). */
  cover: mediaIdSchema,
  /** Alt text of the cover image. */
  coverAlt: z.string(),
});
export type Project = z.infer<typeof projectSchema>;

// ---------------------------------------------------------------------------------------------
// Testimonials (`GET /testimonials`)
// ---------------------------------------------------------------------------------------------

export const testimonialIdSchema = oneOf(TESTIMONIAL_IDS);

export const testimonialSchema = z.object({
  id: testimonialIdSchema,
  quote: z.string(),
  /** Who said it (`.who b`). */
  name: z.string(),
  /** Project type and place (`.who span`). */
  meta: z.string(),
  avatar: mediaIdSchema,
});
export type Testimonial = z.infer<typeof testimonialSchema>;

// ---------------------------------------------------------------------------------------------
// Process stages (`GET /process-stages`): the "master process"
// ---------------------------------------------------------------------------------------------

export const processStageIdSchema = oneOf(PROCESS_STAGE_IDS);

export const processStageSchema = z.object({
  id: processStageIdSchema,
  title: z.string(),
  text: z.string(),
  icon: serviceIconSchema,
});
export type ProcessStage = z.infer<typeof processStageSchema>;

// ---------------------------------------------------------------------------------------------
// Sectors (`GET /sectors`)
// ---------------------------------------------------------------------------------------------

export const sectorKeySchema = oneOf(SECTOR_KEYS);

/** A sector tile (`.ksec`); tiles without a `category` are not links. */
export const sectorTileSchema = z.object({
  /** Small orange label above the title (`.lb small`). */
  label: z.string(),
  title: z.string(),
  text: z.string(),
  image: mediaIdSchema,
  alt: z.string(),
  /** Works filter the tile links to. */
  category: worksCategorySchema.exactOptional(),
});
export type SectorTile = z.infer<typeof sectorTileSchema>;

/** The `/sectors` resource: the shared tiles by key. */
export const sectorSchema = sectorTileSchema.extend({ key: sectorKeySchema });
export type Sector = z.infer<typeof sectorSchema>;

// ---------------------------------------------------------------------------------------------
// Divisions (`GET /divisions`)
// ---------------------------------------------------------------------------------------------

export const divisionSchema = z.object({
  slug: divisionSlugSchema,
  href: hrefSchema,
  /** Full name, e.g. "KATIC Design". */
  name: z.string(),
  /** The part after "KATIC", shown in orange in the division hero. */
  accent: z.string(),
  description: z.string(),
  /** Card image (`.kc .im`). */
  image: mediaIdSchema,
  alt: z.string(),
});
export type Division = z.infer<typeof divisionSchema>;

// ---------------------------------------------------------------------------------------------
// Related services (`GET /related-services`): the service cards (`.kc` service flavour)
// ---------------------------------------------------------------------------------------------

/** Every service but the factory, which has no card. */
export const relatedServiceSlugSchema = oneOf(
  SERVICE_SLUGS.filter(
    (slug): slug is Exclude<(typeof SERVICE_SLUGS)[number], "factory"> => slug !== "factory",
  ),
);

export const relatedServiceSchema = z.object({
  slug: relatedServiceSlugSchema,
  href: hrefSchema,
  title: z.string(),
  text: z.string(),
  image: mediaIdSchema,
  alt: z.string(),
});
export type RelatedService = z.infer<typeof relatedServiceSchema>;
