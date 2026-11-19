import type { MetadataRoute } from "next";

import { builtDivisionSlugs } from "@/content/divisions/pages";
import { POST_CATEGORIES, POSTS } from "@/content/posts";
import { builtProjectSlugs } from "@/content/project-details";
import { builtServiceSlugs } from "@/content/service-pages";
import { LOCATION_SLUGS, routes } from "@/lib/routes";

import { absoluteUrl } from "./site-url";

/** A sitemap entry before it gets the site origin. */
export type SitemapPage = { readonly path: string; readonly lastModified?: string };

/**
 * Every indexable page, generated from the same registries the routes prerender from, so a page
 * added to a registry appears here automatically. `/thank-you` (noindex) and `/api/*` are left out.
 * Articles carry their publication date; other pages have no trustworthy date, so none is given.
 */
export function sitemapPages(): SitemapPage[] {
  return [
    { path: routes.home },
    { path: routes.about },
    { path: routes.services },
    ...builtServiceSlugs().map((slug) => ({ path: routes.service(slug) })),
    { path: routes.works },
    ...builtProjectSlugs().map((slug) => ({ path: routes.project(slug) })),
    ...builtDivisionSlugs().map((slug) => ({ path: routes.division(slug) })),
    ...LOCATION_SLUGS.map((slug) => ({ path: routes.location(slug) })),
    { path: routes.reviews },
    { path: routes.news },
    { path: routes.blog },
    ...POST_CATEGORIES.map(({ slug }) => ({ path: routes.blogCategory(slug) })),
    ...POSTS.map((post) => ({ path: routes.article(post.slug), lastModified: post.publishedAt })),
  ];
}

/** `sitemap.xml` entries with absolute URLs. */
export function sitemapEntries(
  pages: readonly SitemapPage[] = sitemapPages(),
): MetadataRoute.Sitemap {
  return pages.map(({ path, lastModified }) => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  }));
}
