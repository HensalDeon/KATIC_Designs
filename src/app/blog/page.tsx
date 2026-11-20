import type { Metadata } from "next";

import { BlogPage } from "@/components/blog/blog-page";
import { BLOG_PAGE, postsByDate } from "@/content/posts";
import { getSite } from "@/lib/data";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

/** Fully static; "Load more" is a client island over the server-rendered cards. */
export const ensureStatic = "navigation";

// The original's `data-title` / `data-desc` (the title already ends in the brand).
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: routes.blog, ...BLOG_PAGE.seo }, await getSite());
}

/** Blog listing (`#p-blog`, original lines 4054–4065): every post, newest first. */
export default function BlogIndexPage() {
  return <BlogPage posts={postsByDate()} />;
}
