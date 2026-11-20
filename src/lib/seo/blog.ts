import { fillTemplate } from "@/lib/format/template";
import type { ArticleCopy, BlogListingCopy, Post, PostCategory } from "@/lib/schemas/posts";

/** A page's `<title>` and meta description. */
export type SeoCopy = { readonly title: string; readonly description: string };

/** SEO of a category page (`/blog/category/<slug>`): its own title, the listing's description. */
export function categoryPageSeo(
  copy: Pick<BlogListingCopy, "seo">,
  category: Pick<PostCategory, "name">,
): SeoCopy {
  return {
    title: fillTemplate(copy.seo.categoryTitle, { category: category.name }),
    description: copy.seo.description,
  };
}

/**
 * SEO of an article as the original leaves it at runtime: `KB.article` sets "<title> | Katic
 * Designs Blog" and then overwrites it with "<title> — Katic Designs" (JS 4498, KI-S02); the
 * description is the excerpt.
 */
export function articlePageSeo(
  copy: Pick<ArticleCopy, "seoTitle">,
  post: Pick<Post, "title" | "excerpt">,
): SeoCopy {
  return { title: fillTemplate(copy.seoTitle, { title: post.title }), description: post.excerpt };
}
