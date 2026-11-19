import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPage } from "@/components/blog/blog-page";
import {
  blogCategorySeo,
  getPostCategory,
  POST_CATEGORIES,
  postsByCategory,
} from "@/content/posts";

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
  const seo = blogCategorySeo(category);
  return { title: { absolute: seo.title }, description: seo.description };
}

export default async function BlogCategoryPage({ params }: PageProps<"/blog/category/[category]">) {
  const category = getPostCategory((await params).category);
  if (!category) notFound();
  return <BlogPage posts={postsByCategory(category.slug)} category={category} />;
}
