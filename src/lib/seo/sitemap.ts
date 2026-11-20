import type { MetadataRoute } from "next";

import { type DivisionSlug, LOCATION_SLUGS, routes, type ServiceSlug } from "@/lib/routes";
import type { Post, PostCategory } from "@/lib/schemas/posts";

import { absoluteUrl } from "./site-url";

/** A sitemap entry before it gets the site origin. */
export type SitemapPage = { readonly path: string; readonly lastModified?: string };

/**
 * What the data-driven part of the sitemap is generated from: the same lists the routes prerender
 * from (`generateStaticParams`), read through the data layer by `src/app/sitemap.ts`.
 */
export type SitemapSources = {
  readonly servicePages: readonly ServiceSlug[];
  readonly projectPages: readonly string[];
  readonly divisionPages: readonly DivisionSlug[];
  readonly postCategories: readonly Pick<PostCategory, "slug">[];
  readonly posts: readonly Pick<Post, "slug" | "publishedAt">[];
};

/**
 * Every indexable page, generated from the lists the routes prerender from, so a page added to
 * one appears here automatically. `/thank-you` (noindex) and `/api/*` are left out. Articles carry
 * their publication date; other pages have no trustworthy date, so none is given.
 */
export function sitemapPages(sources: SitemapSources): SitemapPage[] {
  return [
    { path: routes.home },
    { path: routes.about },
    { path: routes.services },
    ...sources.servicePages.map((slug) => ({ path: routes.service(slug) })),
    { path: routes.works },
    ...sources.projectPages.map((slug) => ({ path: routes.project(slug) })),
    ...sources.divisionPages.map((slug) => ({ path: routes.division(slug) })),
    ...LOCATION_SLUGS.map((slug) => ({ path: routes.location(slug) })),
    { path: routes.reviews },
    { path: routes.news },
    { path: routes.blog },
    ...sources.postCategories.map(({ slug }) => ({ path: routes.blogCategory(slug) })),
    ...sources.posts.map((post) => ({
      path: routes.article(post.slug),
      lastModified: post.publishedAt,
    })),
  ];
}

/** `sitemap.xml` entries with absolute URLs. */
export function sitemapEntries(pages: readonly SitemapPage[]): MetadataRoute.Sitemap {
  return pages.map(({ path, lastModified }) => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  }));
}
