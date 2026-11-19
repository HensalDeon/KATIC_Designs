import type { StaticImageData } from "next/image";

/** An image served from elsewhere (e.g. the Laravel CMS later). Dimensions are required for CLS-free layout. */
export type RemoteImage = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly blurDataURL?: string;
};

/** Anything `next/image` can render without guessing its intrinsic size. */
export type ImageSource = StaticImageData | RemoteImage;

export type MediaAsset = {
  readonly image: ImageSource;
  /** What the image depicts. Default alt text; content may override it per usage. */
  readonly description: string;
  /** Key of the asset in the original single-file site (provenance only). */
  readonly sourceKey?: string;
};

/**
 * `T` with its media-id fields `K` resolved to images. Server components resolve ids against the
 * manifest (`src/content/media.ts`) and hand client islands this shape, so no client bundle ships
 * the whole manifest.
 */
export type WithImages<T, K extends keyof T> = Omit<T, K> & Readonly<Record<K, ImageSource>>;
