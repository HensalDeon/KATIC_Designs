import type { Metadata } from "next";

import { BlogPage } from "@/components/blog/blog-page";
import { getBlogPage, getSite, listPosts } from "@/lib/data";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

/** Fully static; "Load more" is a client island over the server-rendered cards. */
export const ensureStatic = "navigation";

// The original's `data-title` / `data-desc` (the title already ends in the brand).
export async function generateMetadata(): Promise<Metadata> {
  const [{ page }, site] = await Promise.all([getBlogPage(), getSite()]);
  const { title, description } = page.seo;
  return pageMetadata({ path: routes.blog, title, description }, site);
}

/** Blog listing (`#p-blog`, original lines 4054–4065): every post, newest first. */
export default async function BlogIndexPage() {
  const [{ page }, posts] = await Promise.all([getBlogPage(), listPosts()]);
  return <BlogPage copy={page} posts={posts} />;
}
