/**
 * Building blocks of the content schemas (D6): the closed vocabularies every resource draws from
 * (media ids, slugs, icons, tones) and the small shapes the blocks share (images, titles, actions).
 *
 * ## Conventions
 *
 * - **Optional fields** use `.exactOptional()`: a key is either absent or holds a value, never
 *   `undefined` (`exactOptionalPropertyTypes`). The API omits a key rather than sending `null`.
 * - **Lists** use `list()` (a `readonly` array), so `as const` content satisfies the inferred types.
 * - **Ids** are closed enums generated from the static content (`MediaId`, `ProjectSlug`, …): the
 *   compiler checks every reference in `src/content`. When the CMS owns a collection, its id schema
 *   becomes an open string with a referential check (see docs/DATA_LAYER.md).
 * - **Component-shaped types** (block items whose type lives with its component) are validated with
 *   `shaped<T>()`, which fails to compile when the schema's output stops fitting `T`. Entity types
 *   (Project, Testimonial, SiteSettings, …) are `z.infer` of their schema instead.
 */
import { z } from "zod";

import { SERVICE_ICON_NAMES } from "@/components/icons/service-icon";
import { media, type MediaId } from "@/content/media";
import { SERVICE_NOT_SURE, SERVICE_OPTIONS } from "@/content/services";
import { ICON_NAMES, type IconName } from "@/lib/art";
import type { StageIndex } from "@/lib/art/stages";
import {
  DIVISION_SLUGS,
  INDIA_AREAS,
  LOCATION_SLUGS,
  SERVICE_SLUGS,
  WORKS_CATEGORIES,
} from "@/lib/routes";

/**
 * Returns `schema` unchanged, typed so that it only compiles when its parsed output is assignable
 * to `T` (the hand-written, component-owned type it validates).
 */
export function shaped<T>() {
  return <S extends z.ZodType<T>>(schema: S): S => schema;
}

/** A `readonly` array of `item`. */
export function list<S extends z.ZodType>(item: S) {
  return z.array(item).readonly();
}

/** A non-empty enum from a readonly tuple or list of literals. */
export function oneOf<const T extends string>(values: readonly T[]) {
  return z.enum(values as unknown as readonly [T, ...T[]]);
}

// ---------------------------------------------------------------------------------------------
// Vocabularies
// ---------------------------------------------------------------------------------------------

export const toneSchema = z.enum(["light", "dark"]);
export const serviceSlugSchema = oneOf(SERVICE_SLUGS);
export const divisionSlugSchema = oneOf(DIVISION_SLUGS);
export const locationSlugSchema = oneOf(LOCATION_SLUGS);
export const worksCategorySchema = oneOf(WORKS_CATEGORIES);
export const indiaAreaSchema = oneOf(INDIA_AREAS);
/** A service as named in enquiry forms (the original `SV` list). */
export const serviceOptionSchema = oneOf(SERVICE_OPTIONS);
/** `serviceOptionSchema` plus the popup's "Not sure yet". */
export const enquiryServiceSchema = oneOf([...SERVICE_OPTIONS, SERVICE_NOT_SURE]);
/** Line icon (`ServiceIcon`). */
export const serviceIconSchema = oneOf(SERVICE_ICON_NAMES);
/** Isometric 3D icon (`.ic3`, `src/lib/art/icons.ts`). */
export const artIconSchema = oneOf<IconName>(ICON_NAMES);
/** Isometric stage drawing (`.art3`). */
export const stageIndexSchema = z.union(
  [0, 1, 2, 3, 4, 5, 6].map((n) => z.literal(n)),
) as z.ZodType<StageIndex, StageIndex>;

// ---------------------------------------------------------------------------------------------
// Media (P0-05, P10-03)
// ---------------------------------------------------------------------------------------------

const MEDIA_IDS = Object.keys(media) as MediaId[];

/** An asset of the media library by id, e.g. `photos/bright-living-room`. */
export const mediaIdSchema = oneOf(MEDIA_IDS);
/** A decorative plant cut-out (`plants/*`). */
export const plantAssetSchema = oneOf(
  MEDIA_IDS.filter((id): id is Extract<MediaId, `plants/${string}`> => id.startsWith("plants/")),
);

/** An image served from elsewhere (the CMS), with its intrinsic size for CLS-free layout. */
export const remoteImageSchema = z.object({
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string().exactOptional(),
});

/**
 * An image as content: a media id (resolved through the media library) or an inline remote image.
 * Matches `ImageInput` (`src/components/sections/section-media.ts`).
 */
export const mediaRefSchema = z.union([mediaIdSchema, remoteImageSchema]);

/** An image with the alt text this usage gives it (`SectionImage`). */
export const sectionImageSchema = z.object({ src: mediaRefSchema, alt: z.string() });

// ---------------------------------------------------------------------------------------------
// Copy shapes
// ---------------------------------------------------------------------------------------------

/** A site path or URL: `/works`, `/works?category=villas#works-list`, `#process`, `https://…`. */
export const hrefSchema = z.string().min(1);

/** Title lines as authored (the original's `<br>` breaks). */
export const titleLinesSchema = list(z.string());

/** A title with an orange accent (`AccentTitle`). */
export const accentTitleSchema = z.object({
  lines: titleLinesSchema,
  accent: z.string(),
  accentOnNewLine: z.boolean().exactOptional(),
});

/** A section's button: a link, the Start-a-Project popup, or "go to the page's contact form". */
export const sectionActionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("link"), label: z.string(), href: hrefSchema }),
  z.object({
    kind: z.literal("enquiry"),
    label: z.string(),
    service: serviceOptionSchema.exactOptional(),
  }),
  z.object({
    kind: z.literal("contact"),
    label: z.string(),
    service: serviceOptionSchema.exactOptional(),
    href: hrefSchema.exactOptional(),
  }),
]);

/** The header link of a section (`SectionCta`). */
export const sectionCtaSchema = z.object({
  label: z.string(),
  href: hrefSchema,
  variant: z.enum(["outline", "dark", "outline-light", "outline-ink"]).exactOptional(),
});

/** The standard section header (`.kh`). */
export const sectionHeaderSchema = z.object({
  kicker: z.string(),
  title: titleLinesSchema,
  lead: z.string().exactOptional(),
  cta: sectionCtaSchema.exactOptional(),
});

/** A decorative plant behind a section (`PlantSpec`). */
export const plantSpecSchema = z.object({
  asset: plantAssetSchema,
  corner: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]),
  width: z.number().positive(),
});
