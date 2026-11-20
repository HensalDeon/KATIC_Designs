import { z } from "zod";

import { list } from "./primitives";

/**
 * The media library resource (`GET /media`): every image content can reference by id.
 *
 * Content never embeds image URLs; it names a `MediaId` (`photos/bright-living-room`). Laravel keeps
 * the SAME ids for the assets the site ships today, so they keep resolving to the bundled static
 * imports (hashed, immutable, build-time blur). An id the bundle does not know (a new CMS upload) is
 * resolved through this library: `LaravelRepository` turns it into an inline remote image before
 * parsing (see docs/DATA_LAYER.md, "Media").
 */
export const mediaItemSchema = z.object({
  id: z.string().min(1),
  /** Absolute URL, or a site path for the bundled assets. */
  url: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Default alt text (what the image depicts); content may override it per usage. */
  alt: z.string().exactOptional(),
  blurDataURL: z.string().exactOptional(),
});
export type MediaItem = z.infer<typeof mediaItemSchema>;

export const mediaLibrarySchema = list(mediaItemSchema);
export type MediaLibrary = z.infer<typeof mediaLibrarySchema>;
