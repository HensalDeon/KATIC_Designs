import { media, type MediaId } from "@/content/media";
import type { ImageSource } from "@/lib/media/types";

/** An image given either by its id in the typed manifest or as a resolved source (e.g. from Laravel). */
export type ImageInput = MediaId | ImageSource;

export function resolveImage(image: ImageInput): ImageSource {
  return typeof image === "string" ? media[image].image : image;
}

const CANVAS_WIDTH = 1440;

/**
 * `sizes` for an image that is `canvasPx` wide on the 1440 desktop canvas (which scales with the
 * viewport at ≥1100px), `tablet` wide at ≤1099px and `phone` wide at ≤860px.
 */
export function canvasSizes(canvasPx: number, tablet: string, phone = "100vw"): string {
  const desktop = Math.ceil((canvasPx / CANVAS_WIDTH) * 100);
  return `(max-width: 860px) ${phone}, (max-width: 1099px) ${tablet}, ${String(desktop)}vw`;
}
