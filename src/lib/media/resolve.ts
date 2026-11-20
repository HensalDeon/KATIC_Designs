import "server-only";

import { media, type MediaId } from "@/content/media";

import type { ImageSource } from "./types";

/**
 * Content references images as a `MediaId` (or, for a CMS upload the bundle does not know, an
 * inline remote image). This is the one place an id becomes something `next/image` renders:
 *
 * - today, the bundled static import of `src/content/media.ts` (hashed URL, size, blur);
 * - with Laravel, the same ids still resolve here (Laravel keeps them), and new uploads arrive as
 *   inline `RemoteImage`s that pass through untouched (`LaravelRepository` inlines them from
 *   `/media`, docs/DATA_LAYER.md).
 *
 * Server-only (P10-03): the manifest must not reach a client bundle. Client islands receive
 * resolved `ImageSource`s from their server parent (`WithImages`).
 */
export type MediaRef = MediaId | ImageSource;

export function resolveMedia(ref: MediaRef): ImageSource {
  return typeof ref === "string" ? media[ref].image : ref;
}

/** The library's description of an asset: the default alt text when content gives none. */
export function mediaDescription(id: MediaId): string {
  return media[id].description;
}
