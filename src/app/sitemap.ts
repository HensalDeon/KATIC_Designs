import type { MetadataRoute } from "next";

import { sitemapEntries } from "@/lib/seo/sitemap";

/** `/sitemap.xml`, generated from the route registries (`src/lib/seo/sitemap.ts`). */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
