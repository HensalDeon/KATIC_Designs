import { media, type MediaId } from "@/content/media";
import type { ImageSource } from "@/lib/media/types";

/**
 * `canvasSizes` lives in `@/lib/media/sizes` (no media manifest); client components import it from
 * there, server components may keep importing it from here.
 */
export { canvasSizes } from "@/lib/media/sizes";

/** An image given either by its id in the typed manifest or as a resolved source (e.g. from Laravel). */
export type ImageInput = MediaId | ImageSource;

export function resolveImage(image: ImageInput): ImageSource {
  return typeof image === "string" ? media[image].image : image;
}
