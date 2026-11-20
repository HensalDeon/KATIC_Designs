import { z } from "zod";

import { aboutPageSchema } from "@/lib/schemas/about";
import { blockDefaultsSchema, contactTemplateSchema } from "@/lib/schemas/blocks";
import { divisionPageSchema } from "@/lib/schemas/divisions";
import {
  divisionSchema,
  processStageSchema,
  projectSchema,
  relatedServiceSchema,
  sectorSchema,
  testimonialSchema,
} from "@/lib/schemas/entities";
import { homePageSchema } from "@/lib/schemas/home";
import { dubaiPageSchema, indiaPageSchema } from "@/lib/schemas/locations";
import { mediaLibrarySchema } from "@/lib/schemas/media";
import { navigationSchema } from "@/lib/schemas/navigation";
import { newsItemSchema, newsPageSchema } from "@/lib/schemas/news";
import { blogPageSchema, postCategorySchema, postSchema } from "@/lib/schemas/posts";
import { divisionSlugSchema, list, serviceSlugSchema } from "@/lib/schemas/primitives";
import { projectDetailSchema } from "@/lib/schemas/project-details";
import { reviewsPageSchema } from "@/lib/schemas/reviews";
import { servicePageSchema } from "@/lib/schemas/service-pages";
import { servicesPageSchema } from "@/lib/schemas/services-page";
import { siteSettingsSchema } from "@/lib/schemas/site";
import { thankYouPageSchema } from "@/lib/schemas/thank-you";
import { worksPageSchema } from "@/lib/schemas/works";

import type { ContentRepository } from "../repository";
import { ALL_CONTENT_TAG } from "../tags";

/**
 * The REST resources of the Laravel API, one per `ContentRepository` method: the single table that
 * `LaravelRepository` reads, `pnpm mock:laravel` serves and `pnpm api:contract` documents
 * (docs/API_CONTRACT.md), so the three cannot disagree.
 *
 * `path` and `tags` are templates: `{slug}` is the method's argument. `schema` validates `data` of
 * the response (every resource has one). Tags mirror the accessors in `../accessors.ts`.
 */

export type EndpointArgs = { readonly slug?: string; readonly category?: string };

export type Endpoint = {
  readonly path: string;
  /** Query parameters the method forwards (`listProjects({ category })` → `?category=`). */
  readonly query?: readonly "category"[];
  readonly schema: z.ZodType;
  /** `true`: 404 means "no such slug" (`undefined`), not an error. */
  readonly notFound?: true;
  readonly tags: readonly string[];
  readonly summary: string;
  /** Arguments of the documented example (and the mock smoke test). */
  readonly example?: EndpointArgs;
};

export type EndpointName = keyof ContentRepository;

const slugList = (slug: z.ZodType) => list(slug);

export const ENDPOINTS = {
  // Site shell ---------------------------------------------------------------------------------
  getSite: {
    path: "/settings",
    schema: siteSettingsSchema,
    tags: ["site"],
    summary: "Site settings: contact channels, offices, social links, default SEO.",
  },
  getNavigation: {
    path: "/navigation",
    schema: navigationSchema,
    tags: ["navigation"],
    summary: "Header menu (with dropdowns) and footer columns.",
  },
  getMediaLibrary: {
    path: "/media",
    schema: mediaLibrarySchema,
    tags: ["media"],
    summary: "Every image content can reference by id (see Media).",
  },
  getContactTemplate: {
    path: "/contact",
    schema: contactTemplateSchema,
    tags: ["contact"],
    summary: "The contact section shared by every page (form copy, channels).",
  },
  getBlockDefaults: {
    path: "/block-defaults",
    schema: blockDefaultsSchema,
    tags: ["block-defaults"],
    summary: "Copy that content blocks show unless a page overrides it (the testimonials header).",
  },

  // Shared entities ----------------------------------------------------------------------------
  listProjects: {
    path: "/projects",
    query: ["category"],
    schema: list(projectSchema),
    tags: ["projects"],
    summary: "All projects in display order; `?category=` filters to a works category.",
  },
  getProject: {
    path: "/projects/{slug}",
    schema: projectSchema,
    notFound: true,
    tags: ["projects", "project:{slug}"],
    summary: "One project (card facts).",
    example: { slug: "the-courtyard-house" },
  },
  listTestimonials: {
    path: "/testimonials",
    schema: list(testimonialSchema),
    tags: ["testimonials"],
    summary: "The testimonial pool, in display order.",
  },
  listProcessStages: {
    path: "/process-stages",
    schema: list(processStageSchema),
    tags: ["process-stages"],
    summary: "The master design-and-build process.",
  },
  listSectors: {
    path: "/sectors",
    schema: list(sectorSchema),
    tags: ["sectors"],
    summary: "Sector tiles (residential, commercial, …).",
  },
  listDivisions: {
    path: "/divisions",
    schema: list(divisionSchema),
    tags: ["divisions"],
    summary: "The divisions (cards, strips, menus).",
  },
  listRelatedServices: {
    path: "/related-services",
    schema: list(relatedServiceSchema),
    tags: ["related-services"],
    summary: "Service cards shown across pages.",
  },

  // Services -----------------------------------------------------------------------------------
  listServicePageSlugs: {
    path: "/services",
    schema: slugList(serviceSlugSchema),
    tags: ["services"],
    summary: "Slugs of the service pages that exist, in the site's order.",
  },
  getServicePage: {
    path: "/services/{slug}",
    schema: servicePageSchema,
    notFound: true,
    tags: ["services", "service:{slug}"],
    summary: "One service page: hero, sections (blocks), FAQ and contact.",
    example: { slug: "interior" },
  },
  getServicesPage: {
    path: "/pages/services",
    schema: servicesPageSchema,
    tags: ["page:services"],
    summary: "The /services overview page.",
  },

  // Divisions ----------------------------------------------------------------------------------
  listDivisionPageSlugs: {
    path: "/division-pages",
    schema: slugList(divisionSlugSchema),
    tags: ["divisions"],
    summary: "Slugs of the divisions that have a page.",
  },
  getDivisionPage: {
    path: "/divisions/{slug}",
    schema: divisionPageSchema,
    notFound: true,
    tags: ["divisions", "division:{slug}"],
    summary: "One division page.",
    example: { slug: "interior" },
  },

  // Locations ----------------------------------------------------------------------------------
  getIndiaPage: {
    path: "/locations/india",
    schema: indiaPageSchema,
    tags: ["location:india"],
    summary: "The India location page.",
  },
  getDubaiPage: {
    path: "/locations/dubai",
    schema: dubaiPageSchema,
    tags: ["location:dubai"],
    summary: "The Dubai location page.",
  },

  // Works --------------------------------------------------------------------------------------
  listProjectPageSlugs: {
    path: "/project-pages",
    schema: slugList(z.string().min(1)),
    tags: ["projects"],
    summary: "Slugs of the projects that have a detail page (/works/{slug}).",
  },
  getProjectPage: {
    path: "/projects/{slug}/page",
    schema: projectDetailSchema,
    notFound: true,
    tags: ["projects", "project:{slug}"],
    summary: "A project's detail page (case study).",
    example: { slug: "the-courtyard-house" },
  },
  getWorksPage: {
    path: "/pages/works",
    schema: worksPageSchema,
    tags: ["page:works"],
    summary: "The /works page.",
  },

  // Blog and news ------------------------------------------------------------------------------
  listPostCategories: {
    path: "/post-categories",
    schema: list(postCategorySchema),
    tags: ["posts"],
    summary: "Blog categories (name and slug).",
  },
  listPosts: {
    path: "/posts",
    query: ["category"],
    schema: list(postSchema),
    tags: ["posts"],
    summary: "Posts newest first; `?category=` is a category slug.",
  },
  getPost: {
    path: "/posts/{slug}",
    schema: postSchema,
    notFound: true,
    tags: ["posts", "post:{slug}"],
    summary: "One article.",
    example: { slug: "designing-for-kerala-monsoon" },
  },
  getBlogPage: {
    path: "/pages/blog",
    schema: blogPageSchema,
    tags: ["page:blog"],
    summary: "Copy of the blog listing and article templates.",
  },
  listNews: {
    path: "/news",
    schema: list(newsItemSchema),
    tags: ["news"],
    summary: "News items newest first.",
  },
  getNewsPage: {
    path: "/pages/news",
    schema: newsPageSchema,
    tags: ["page:news"],
    summary: "The /news page.",
  },

  // Pages --------------------------------------------------------------------------------------
  getHomePage: {
    path: "/pages/home",
    schema: homePageSchema,
    tags: ["page:home"],
    summary: "The home page sections.",
  },
  getAboutPage: {
    path: "/pages/about",
    schema: aboutPageSchema,
    tags: ["page:about"],
    summary: "The /about page sections.",
  },
  getReviewsPage: {
    path: "/pages/reviews",
    schema: reviewsPageSchema,
    tags: ["page:reviews"],
    summary: "The /reviews page sections.",
  },
  getThankYouPage: {
    path: "/pages/thank-you",
    schema: thankYouPageSchema,
    tags: ["page:thank-you"],
    summary: "The /thank-you page copy.",
  },
} as const satisfies Record<EndpointName, Endpoint>;

export const ENDPOINT_NAMES = Object.keys(ENDPOINTS) as EndpointName[];

/** The documented example arguments of an endpoint (`{}` when it takes none). */
export function exampleArgs(name: EndpointName): EndpointArgs {
  const endpoint: Endpoint = ENDPOINTS[name];
  return endpoint.example ?? {};
}

type AnyRepository = Record<EndpointName, (arg?: unknown) => Promise<unknown>>;

/**
 * Calls repository method `name` with an endpoint's arguments: the slug for `{slug}` paths, the
 * filter object for paths with a query, nothing otherwise. Used by the mock and the generator.
 */
export function invokeEndpoint(
  repository: ContentRepository,
  name: EndpointName,
  args: EndpointArgs = {},
): Promise<unknown> {
  const target = repository as unknown as AnyRepository;
  const endpoint: Endpoint = ENDPOINTS[name];
  if (endpoint.path.includes("{slug}")) return target[name](args.slug ?? "");
  if (endpoint.query) return target[name](args.category ? { category: args.category } : {});
  return target[name]();
}

/** `/projects/{slug}` + `{ slug: "a b" }` → `/projects/a%20b`, plus the declared query. */
export function endpointPath(endpoint: Endpoint, args: EndpointArgs = {}): string {
  const path = endpoint.path.replace("{slug}", encodeURIComponent(args.slug ?? ""));
  const query = new URLSearchParams();
  for (const key of endpoint.query ?? []) {
    const value = args[key];
    if (value !== undefined) query.set(key, value);
  }
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

/** The cache tags a read of `endpoint` carries (always including `content`). */
export function endpointTags(endpoint: Endpoint, args: EndpointArgs = {}): string[] {
  return [ALL_CONTENT_TAG, ...endpoint.tags.map((tag) => tag.replace("{slug}", args.slug ?? ""))];
}

/**
 * Matches a request path against the table (the mock's router): the endpoint and its arguments, or
 * `undefined`. Literal paths win over `{slug}` templates.
 */
export function matchEndpoint(
  path: string,
  query: URLSearchParams,
): { name: EndpointName; args: EndpointArgs } | undefined {
  const ordered = [...ENDPOINT_NAMES].sort(
    (a, b) => Number(ENDPOINTS[a].path.includes("{")) - Number(ENDPOINTS[b].path.includes("{")),
  );
  for (const name of ordered) {
    const endpoint: Endpoint = ENDPOINTS[name];
    const pattern = new RegExp(
      `^${endpoint.path.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace("{slug}", "([^/]+)")}$`,
    );
    const match = pattern.exec(path);
    if (!match) continue;
    const slug = match[1] === undefined ? undefined : decodeURIComponent(match[1]);
    const category = endpoint.query?.includes("category")
      ? (query.get("category") ?? undefined)
      : undefined;
    return {
      name,
      args: {
        ...(slug === undefined ? {} : { slug }),
        ...(category === undefined ? {} : { category }),
      },
    };
  }
  return undefined;
}
