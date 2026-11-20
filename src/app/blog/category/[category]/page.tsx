import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPage } from "@/components/blog/blog-page";
import { JsonLd } from "@/components/seo/json-ld";
import { getBlogPage, getSite, getTrailLabels, listPostCategories, listPosts } from "@/lib/data";
import { routes } from "@/lib/routes";
import { categoryPageSeo } from "@/lib/seo/blog";
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

export async function generateStaticParams(): Promise<{ category: string }[]> {
  return (await listPostCategories()).map(({ slug }) => ({ category: slug }));
}

/** The category with this URL slug, or `undefined` (a 404), and every category. */
async function findCategory(slug: string) {
  const categories = await listPostCategories();
  return { current: categories.find((entry) => entry.slug === slug), all: categories };
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/category/[category]">): Promise<Metadata> {
  const [{ current }, { page }, site] = await Promise.all([
    findCategory((await params).category),
    getBlogPage(),
    getSite(),
  ]);
  if (!current) notFound();
  return pageMetadata(
    { path: routes.blogCategory(current.slug), ...categoryPageSeo(page, current) },
    site,
  );
}

export default async function BlogCategoryPage({ params }: PageProps<"/blog/category/[category]">) {
  const { current, all } = await findCategory((await params).category);
  if (!current) notFound();
  const [{ page }, posts, labels] = await Promise.all([
    getBlogPage(),
    listPosts({ category: current.slug }),
    getTrailLabels(),
  ]);
  return (
    <>
      <BlogPage copy={page} posts={posts} category={{ current, all }} />
      <JsonLd data={breadcrumbLd(blogCategoryTrail(current, labels))} />
    </>
  );
}
