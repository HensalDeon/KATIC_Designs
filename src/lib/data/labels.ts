import "server-only";

import type { TrailLabels } from "@/lib/seo/breadcrumbs";

import { getBlogPage, getNavigation, listDivisions, listRelatedServices } from "./accessors";

/** The labels breadcrumb trails are named with (`src/lib/seo/breadcrumbs.ts`), from cached reads. */
export async function getTrailLabels(): Promise<TrailLabels> {
  const [navigation, services, divisions, blogPage] = await Promise.all([
    getNavigation(),
    listRelatedServices(),
    listDivisions(),
    getBlogPage(),
  ]);
  return { nav: navigation.header, services, divisions, blog: blogPage.article.breadcrumb };
}
