import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPage } from "@/components/blog/blog-page";
import { JsonLd } from "@/components/seo/json-ld";
import {
  blogCategorySeo,
  getPostCategory,
  POST_CATEGORIES,
  postsByCategory,
} from "@/content/posts";
import { getSite, getTrailLabels } from "@/lib/data";
import { routes } from "@/lib/routes";
import { blogCategoryTrail } from "@/lib/seo/breadcrumbs";
import { breadcrumbLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * Blog category pages (`/blog/category/<slug>`, the original's `#blog/<anchor>/<category>` deep
 * links, docs/analysis/04 §13). The original filtered one client-side grid with its category UI
 * hidden (KI-F13); here each category is a prerendered page with its links visible. Unknown slugs
 * (including `all`, which the legacy redirect sends to `/blog`) are a real 404; see
 * `/services/[slug]` for `ensureStatic` (P6-02).
 */
export const ensureStatic = "navigation";

export function generateStaticParams(): { category: string }[] {
  return POST_CATEGORIES.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/category/[category]">): Promise<Metadata> {
  const category = getPostCategory((await params).category);
  if (!category) notFound();
  return pageMetadata(
    { path: routes.blogCategory(category.slug), ...blogCategorySeo(category) },
    await getSite(),
  );
}

export default async function BlogCategoryPage({ params }: PageProps<"/blog/category/[category]">) {
  const category = getPostCategory((await params).category);
  if (!category) notFound();
  return (
    <>
      <BlogPage posts={postsByCategory(category.slug)} category={category} />
      <JsonLd data={breadcrumbLd(blogCategoryTrail(category, await getTrailLabels()))} />
    </>
  );
}
