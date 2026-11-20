import type { MediaRef } from "@/lib/media/resolve";

/**
 * `canvasSizes` lives in `@/lib/media/sizes` (no media manifest); client components import it from
 * there, server components may keep importing it from here.
 */
export { canvasSizes } from "@/lib/media/sizes";

/** An image given either by its id in the typed manifest or as a resolved source (e.g. from Laravel). */
export type ImageInput = MediaRef;

export { resolveMedia as resolveImage } from "@/lib/media/resolve";
