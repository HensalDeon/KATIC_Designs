/**
 * The REST resources of the mock, built from the static content. Paths are relative to the API
 * prefix (`/api/v1`). Returns `undefined` for unknown paths (404).
 */
import { media } from "@/content/media";

export type ResourceContext = { query: URLSearchParams; mediaOrigin: string };

export async function resolveResource(path: string, context: ResourceContext): Promise<unknown> {
  if (path === "/media") {
    return {
      data: Object.entries(media).map(([id, asset]) => {
        const image = asset.image as unknown as { src: string; width: number; height: number };
        return {
          id,
          url: `${context.mediaOrigin}${image.src}`,
          width: image.width,
          height: image.height,
          alt: asset.description,
        };
      }),
    };
  }
  return Promise.resolve(undefined);
}
