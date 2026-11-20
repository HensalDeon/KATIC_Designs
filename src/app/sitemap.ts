import type { MetadataRoute } from "next";

import {
  listDivisionPageSlugs,
  listPostCategories,
  listPosts,
  listProjectPageSlugs,
  listServicePageSlugs,
} from "@/lib/data";
import { sitemapEntries, sitemapPages } from "@/lib/seo/sitemap";

/** `/sitemap.xml`, generated from the lists the routes prerender from (`src/lib/seo/sitemap.ts`). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [servicePages, projectPages, divisionPages, postCategories, posts] = await Promise.all([
    listServicePageSlugs(),
    listProjectPageSlugs(),
    listDivisionPageSlugs(),
    listPostCategories(),
    listPosts(),
  ]);
  return sitemapEntries(
    sitemapPages({ servicePages, projectPages, divisionPages, postCategories, posts }),
  );
}
