import { cacheTag } from "next/cache";
import { z } from "zod";

import { media } from "@/content/media";
import type { MediaLibrary } from "@/lib/schemas/media";
import { mediaLibrarySchema } from "@/lib/schemas/media";

import type {
  AboutPage,
  BlogPage,
  ContentRepository,
  DubaiPage,
  HomePage,
  IndiaPage,
  NewsPage,
  PostFilter,
  ProjectFilter,
  ReviewsPage,
  ServicesPage,
  ThankYouPage,
  WorksPage,
} from "../repository";
import { type EndpointArgs, type EndpointName, endpointPath, ENDPOINTS } from "./endpoints";
import { type LaravelClientConfig, laravelGet, LaravelHttpError, LaravelSchemaError } from "./http";

type Repo = ContentRepository;
/** The resolved value of repository method `K`. */
type Result<K extends EndpointName> = Awaited<ReturnType<Repo[K]>>;

/** Pass-through for resources whose schema is not written yet (see `ENDPOINTS[…].schema`). */
const UNVALIDATED = z.unknown();

const BUNDLED_MEDIA: ReadonlySet<string> = new Set(Object.keys(media));
/** Looks like a media id (`folder/name`), not a path (`/…`), URL or sentence. */
const MEDIA_ID_LIKE = /^[a-z0-9][a-z0-9_-]*\/[a-z0-9][a-z0-9._/-]*$/;

/**
 * `ContentRepository` over the Laravel REST API (Phase 11, docs/API_CONTRACT.md).
 *
 * - **Reads only.** Caching and tags live in the accessors (`../accessors.ts`): every method here
 *   runs inside their `"use cache"` scope, so the API is called at build time and again only when
 *   `/api/revalidate` names a tag (or the laravel-mode safety net expires).
 * - **Boundary checks.** Every response is parsed with the resource's schema (`./endpoints.ts`);
 *   failures throw typed errors from `./http.ts` (network / timeout / http / schema), which fail
 *   the build or, at run time, keep the previously cached page.
 * - **Media.** Laravel keeps the bundled media ids, which still resolve to the static imports. A
 *   media id the bundle does not know (a CMS upload) is replaced before parsing by an inline
 *   `RemoteImage` from `/media`, so `resolveMedia()` renders it as a remote `next/image` source.
 */
export class LaravelRepository implements ContentRepository {
  readonly #config: LaravelClientConfig;

  constructor(config: LaravelClientConfig) {
    this.#config = config;
  }

  async #read<K extends EndpointName>(name: K, args: EndpointArgs = {}): Promise<Result<K>> {
    const endpoint = ENDPOINTS[name];
    const path = endpointPath(endpoint, args);
    const raw = await laravelGet(this.#config, path, UNVALIDATED, {
      allowNotFound: true,
    });
    if (raw === null) {
      if ("notFound" in endpoint) return undefined as Result<K>;
      // A collection or page must exist: a 404 here is a contract error, not "no such slug".
      throw new LaravelHttpError(path, 404, "");
    }
    const data = name === "getMediaLibrary" ? raw : await this.#inlineUploads(raw);
    if (!endpoint.schema) return data as Result<K>;
    return parseOrThrow(endpoint.schema, data, path) as Result<K>;
  }

  /** Replaces unknown media ids found in `data` with inline remote images from `/media`. */
  async #inlineUploads(data: unknown): Promise<unknown> {
    const candidates = new Set<string>();
    walk(data, (text) => {
      if (MEDIA_ID_LIKE.test(text) && !BUNDLED_MEDIA.has(text)) candidates.add(text);
    });
    if (candidates.size === 0) return data;

    const library = await laravelGet(
      this.#config,
      ENDPOINTS.getMediaLibrary.path,
      mediaLibrarySchema,
    );
    tagCurrentCache("media");
    const uploads = new Map(
      library
        .filter((item) => candidates.has(item.id))
        .map((item) => [
          item.id,
          {
            src: item.url,
            width: item.width,
            height: item.height,
            ...(item.blurDataURL ? { blurDataURL: item.blurDataURL } : {}),
          },
        ]),
    );
    return uploads.size === 0 ? data : replaceStrings(data, uploads);
  }

  // Site shell -----------------------------------------------------------------------------------

  getSite() {
    return this.#read("getSite");
  }
  getNavigation() {
    return this.#read("getNavigation");
  }
  getMediaLibrary(): Promise<MediaLibrary> {
    return this.#read("getMediaLibrary");
  }
  getContactTemplate() {
    return this.#read("getContactTemplate");
  }

  // Shared entities ------------------------------------------------------------------------------

  listProjects(filter: ProjectFilter = {}) {
    return this.#read("listProjects", filter.category ? { category: filter.category } : {});
  }
  getProject(slug: string) {
    return this.#read("getProject", { slug });
  }
  listTestimonials() {
    return this.#read("listTestimonials");
  }
  listProcessStages() {
    return this.#read("listProcessStages");
  }
  listSectors() {
    return this.#read("listSectors");
  }
  listDivisions() {
    return this.#read("listDivisions");
  }
  listRelatedServices() {
    return this.#read("listRelatedServices");
  }

  // Services -------------------------------------------------------------------------------------

  listServicePageSlugs() {
    return this.#read("listServicePageSlugs");
  }
  getServicePage(slug: string) {
    return this.#read("getServicePage", { slug });
  }
  getServicesPage(): Promise<ServicesPage> {
    return this.#read("getServicesPage");
  }

  // Divisions ------------------------------------------------------------------------------------

  listDivisionPageSlugs() {
    return this.#read("listDivisionPageSlugs");
  }
  getDivisionPage(slug: string) {
    return this.#read("getDivisionPage", { slug });
  }

  // Locations ------------------------------------------------------------------------------------

  getIndiaPage(): Promise<IndiaPage> {
    return this.#read("getIndiaPage");
  }
  getDubaiPage(): Promise<DubaiPage> {
    return this.#read("getDubaiPage");
  }

  // Works ----------------------------------------------------------------------------------------

  listProjectPageSlugs() {
    return this.#read("listProjectPageSlugs");
  }
  getProjectPage(slug: string) {
    return this.#read("getProjectPage", { slug });
  }
  getWorksPage(): Promise<WorksPage> {
    return this.#read("getWorksPage");
  }

  // Blog and news --------------------------------------------------------------------------------

  listPostCategories() {
    return this.#read("listPostCategories");
  }
  listPosts(filter: PostFilter = {}) {
    return this.#read("listPosts", filter.category ? { category: filter.category } : {});
  }
  getPost(slug: string) {
    return this.#read("getPost", { slug });
  }
  getBlogPage(): Promise<BlogPage> {
    return this.#read("getBlogPage");
  }
  listNews() {
    return this.#read("listNews");
  }
  getNewsPage(): Promise<NewsPage> {
    return this.#read("getNewsPage");
  }

  // Pages ----------------------------------------------------------------------------------------

  getHomePage(): Promise<HomePage> {
    return this.#read("getHomePage");
  }
  getAboutPage(): Promise<AboutPage> {
    return this.#read("getAboutPage");
  }
  getReviewsPage(): Promise<ReviewsPage> {
    return this.#read("getReviewsPage");
  }
  getThankYouPage(): Promise<ThankYouPage> {
    return this.#read("getThankYouPage");
  }
}

function parseOrThrow(schema: z.ZodType, data: unknown, path: string): unknown {
  const parsed = schema.safeParse(data);
  if (parsed.success) return parsed.data;
  throw new LaravelSchemaError(
    path,
    parsed.error.issues
      .slice(0, 10)
      .map((issue) => `data.${issue.path.join(".")}: ${issue.message}`),
  );
}

/** Calls `visit` for every string in a JSON value. */
function walk(value: unknown, visit: (text: string) => void): void {
  if (typeof value === "string") visit(value);
  else if (Array.isArray(value)) for (const item of value) walk(item, visit);
  else if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) walk(item, visit);
  }
}

/** A copy of `value` with every string that is a key of `replacements` replaced. */
function replaceStrings(value: unknown, replacements: ReadonlyMap<string, unknown>): unknown {
  if (typeof value === "string") return replacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => replaceStrings(item, replacements));
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceStrings(item, replacements)]),
    );
  }
  return value;
}

/**
 * Adds `tag` to the cache entry being filled (the accessor's `"use cache"` scope), so replacing an
 * upload in the media library refreshes the pages that inline it. Outside a cache scope (tests)
 * there is nothing to tag.
 */
function tagCurrentCache(tag: string): void {
  try {
    cacheTag(tag);
  } catch {
    // Not inside "use cache".
  }
}
