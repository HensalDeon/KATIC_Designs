import type { MediaId } from "@/content/media";
import { resolveMedia } from "@/lib/media/resolve";
import type { ImageSource } from "@/lib/media/types";

/**
 * An image as section content: a local asset id (`src/content/media.ts`) or any `ImageSource`
 * (e.g. a remote image from the CMS later), with the alt text the content provides for this usage.
 */
export type SectionImage = {
  readonly src: MediaId | ImageSource;
  readonly alt: string;
};

/** Resolves a `SectionImage` source to something `next/image` can render (`resolveMedia`). */
export const resolveImage: (src: SectionImage["src"]) => ImageSource = resolveMedia;
