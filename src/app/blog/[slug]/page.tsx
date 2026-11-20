import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/blog/article-page";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getBlogPage,
  getPost,
  getSite,
  getTrailLabels,
  listPostCategories,
  listPosts,
} from "@/lib/data";
import { resolveMedia } from "@/lib/media/resolve";
import { routes } from "@/lib/routes";
import { articlePageSeo } from "@/lib/seo/blog";
import { articleTrail } from "@/lib/seo/breadcrumbs";
import { blogPostingLd, breadcrumbLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * Articles (`/blog/<slug>`, original `#p-article` filled by `KB.article`, docs/analysis/04 §6).
 * Every post is prerendered; an unknown slug is a real 404 instead of the original's silent
 * fallback to the first post (KI-F12). `ensureStatic` as on `/services/[slug]` (P6-02).
 */
export const ensureStatic = "navigation";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await listPosts()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const [post, { article }, site] = await Promise.all([
    getPost((await params).slug),
    getBlogPage(),
    getSite(),
  ]);
  if (!post) notFound();
  return pageMetadata(
    {
      path: routes.article(post.slug),
      ...articlePageSeo(article, post),
      article: { publishedTime: post.publishedAt, section: post.category },
    },
    site,
  );
}

/**
 * BlogPosting and the breadcrumb trail are rendered with the article, so they exist only on its
 * page (the original's `#ld-article` stayed in the document after leaving it, KI-S02).
 */
export default async function ArticleRoute({ params }: PageProps<"/blog/[slug]">) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const [{ article }, posts, site, categories, labels] = await Promise.all([
    getBlogPage(),
    listPosts(),
    getSite(),
    listPostCategories(),
    getTrailLabels(),
  ]);
  const category = categories.find((entry) => entry.name === post.category);
  if (!category) throw new Error(`Unknown post category: ${post.category}`);
  // The aside (original `KB.article`, JS 4497): every other post, newest first.
  const latest = posts.filter((other) => other.slug !== post.slug).slice(0, article.latestCount);
  return (
    <>
      <ArticlePage copy={article} post={post} category={category} latest={latest} />
      <JsonLd
        data={[
          blogPostingLd(post, site, resolveMedia(post.cover).src),
          breadcrumbLd(articleTrail(post, category, labels)),
        ]}
      />
    </>
  );
}
