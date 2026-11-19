import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/blog/article-page";
import { JsonLd } from "@/components/seo/json-ld";
import { media } from "@/content/media";
import { articleSeo, getPost, POSTS } from "@/content/posts";
import { routes } from "@/lib/routes";
import { articleTrail } from "@/lib/seo/breadcrumbs";
import { blogPostingLd, breadcrumbLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * Articles (`/blog/<slug>`, original `#p-article` filled by `KB.article`, docs/analysis/04 §6).
 * Every post is prerendered; an unknown slug is a real 404 instead of the original's silent
 * fallback to the first post (KI-F12). `ensureStatic` as on `/services/[slug]` (P6-02).
 */
export const ensureStatic = "navigation";

export function generateStaticParams(): { slug: string }[] {
  return POSTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return pageMetadata({
    path: routes.article(post.slug),
    ...articleSeo(post),
    article: { publishedTime: post.publishedAt, section: post.category },
  });
}

/**
 * BlogPosting and the breadcrumb trail are rendered with the article, so they exist only on its
 * page (the original's `#ld-article` stayed in the document after leaving it, KI-S02).
 */
export default async function ArticleRoute({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return (
    <>
      <ArticlePage post={post} />
      <JsonLd
        data={[blogPostingLd(post, media[post.cover].image.src), breadcrumbLd(articleTrail(post))]}
      />
    </>
  );
}
