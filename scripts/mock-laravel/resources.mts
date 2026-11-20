/**
 * The REST resources of the mock, built from the static content: every endpoint of the shared
 * table (`src/lib/data/laravel/endpoints.ts`) answered by the `StaticRepository` method of the same
 * name, wrapped in Laravel's `{ "data": … }` envelope. Paths are relative to `/api/v1`. The
 * contract generator (`scripts/api-contract/generate.mts`) uses the same functions.
 *
 * Content modules import images; load this only after the asset hooks (`./asset-hooks.mts`).
 */
import {
  type EndpointArgs,
  type EndpointName,
  invokeEndpoint,
  matchEndpoint,
} from "@/lib/data/laravel/endpoints";
import { StaticRepository } from "@/lib/data/static-repository";
import type { MediaLibrary } from "@/lib/schemas/media";

export type ResourceContext = { query: URLSearchParams; mediaOrigin: string };

const repository = new StaticRepository({ validate: true });

/**
 * `data` of an endpoint as Laravel would serialise it: a JSON round trip of the static content,
 * with the media library's site paths (`/media/…`) made absolute on `mediaOrigin`.
 * `undefined` for an unknown slug.
 */
export async function staticResource(
  name: EndpointName,
  args: EndpointArgs,
  mediaOrigin: string,
): Promise<unknown> {
  const data = await invokeEndpoint(repository, name, args);
  if (data === undefined) return undefined;
  if (name === "getMediaLibrary") {
    return (data as MediaLibrary).map((item) => ({
      ...item,
      url: item.url.startsWith("/") ? `${mediaOrigin}${item.url}` : item.url,
    }));
  }
  return JSON.parse(JSON.stringify(data)) as unknown;
}

/** `{ data }` for a known path, `undefined` for an unknown path or slug (404). */
export async function resolveResource(path: string, context: ResourceContext): Promise<unknown> {
  const match = matchEndpoint(path, context.query);
  if (!match) return undefined;
  const data = await staticResource(match.name, match.args, context.mediaOrigin);
  return data === undefined ? undefined : { data };
}
