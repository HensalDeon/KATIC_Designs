import type { Metadata } from "next";

import { BlogPage } from "@/components/blog/blog-page";
import { BLOG_PAGE, postsByDate } from "@/content/posts";

/** Fully static; "Load more" is a client island over the server-rendered cards. */
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  // The original's `data-title` already ends in the brand.
  title: { absolute: BLOG_PAGE.seo.title },
  description: BLOG_PAGE.seo.description,
};

/** Blog listing (`#p-blog`, original lines 4054–4065): every post, newest first. */
export default function BlogIndexPage() {
  return <BlogPage posts={postsByDate()} />;
}
