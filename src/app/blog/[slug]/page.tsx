import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/blog/article-page";
import { articleSeo, getPost, POSTS } from "@/content/posts";

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
  const seo = articleSeo(post);
  return { title: { absolute: seo.title }, description: seo.description };
}

export default async function ArticleRoute({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return <ArticlePage post={post} />;
}
