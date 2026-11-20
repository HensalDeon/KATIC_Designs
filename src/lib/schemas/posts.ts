import { z } from "zod";

import { POST_CATEGORIES } from "@/content/posts";
import { templatePlaceholders } from "@/lib/format/template";

import { accentTitleSchema, list, mediaIdSchema, oneOf } from "./primitives";

/**
 * The blog (`GET /posts`, `GET /posts/{slug}`, `GET /post-categories`, `GET /pages/blog`): posts
 * with a block body, their categories, and the copy of the listing and article pages.
 */

// ---------------------------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------------------------

/** ISO calendar date, `YYYY-MM-DD`. */
export const isoDateSchema = z.iso.date();

/**
 * Copy with `{name}` placeholders (`fillTemplate`): exactly the placeholders `names`, so a CMS edit
 * cannot drop the value the page fills in or add one it does not know.
 */
export function templateSchema(...names: readonly string[]) {
  const expected = [...names].sort().join(",");
  return z
    .string()
    .refine((template) => templatePlaceholders(template).sort().join(",") === expected, {
      message: `Expected the placeholders ${names.map((name) => `{${name}}`).join(", ")}`,
    });
}

// ---------------------------------------------------------------------------------------------
// Categories (`GET /post-categories`)
// ---------------------------------------------------------------------------------------------

export const postCategoryNameSchema = oneOf(POST_CATEGORIES.map((category) => category.name));
export const postCategorySlugSchema = oneOf(POST_CATEGORIES.map((category) => category.slug));

export const postCategorySchema = z.object({
  name: postCategoryNameSchema,
  /** URL slug (`/blog/category/<slug>`). */
  slug: postCategorySlugSchema,
});
export type PostCategory = z.infer<typeof postCategorySchema>;

// ---------------------------------------------------------------------------------------------
// Posts (`GET /posts?category=`, `GET /posts/{slug}`)
// ---------------------------------------------------------------------------------------------

/** One block of an article body (original tuples `['p'|'h'|'ul'|'img', …]`). Plain text. */
export const postBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string() }),
  z.object({ type: z.literal("h"), text: z.string() }),
  z.object({ type: z.literal("ul"), items: list(z.string()) }),
  z.object({ type: z.literal("img"), image: mediaIdSchema, caption: z.string() }),
]);
export type PostBlock = z.infer<typeof postBlockSchema>;

export const postSchema = z.object({
  /** URL slug (`s`). */
  slug: z.string().min(1),
  /** Title (`t`). */
  title: z.string(),
  /** Category name (`c`). */
  category: postCategoryNameSchema,
  /** Publication date (`d`). */
  publishedAt: isoDateSchema,
  /** View count (`v`); the listing's "Most Popular" sort. */
  views: z.number().int().nonnegative(),
  /** Cover image (`i`). */
  cover: mediaIdSchema,
  /** Author (`a`). The original's authors are teams, not people (KI-S02). */
  author: z.string(),
  /** Excerpt (`x`); also the article's meta description. */
  excerpt: z.string(),
  /** Body blocks (`b`). */
  body: list(postBlockSchema),
});
export type Post = z.infer<typeof postSchema>;

// ---------------------------------------------------------------------------------------------
// Pages (`GET /pages/blog`)
// ---------------------------------------------------------------------------------------------

/** The listing (`#p-blog`) and the category pages built from it. */
export const blogListingCopySchema = z.object({
  /** `data-title` / `data-desc`; category pages reuse the description. */
  seo: z.object({
    title: z.string(),
    description: z.string(),
    /** Document title of a category page; the original has none of its own. */
    categoryTitle: templateSchema("category"),
  }),
  hero: z.object({
    image: mediaIdSchema,
    kicker: z.string(),
    title: accentTitleSchema,
    lead: z.string(),
  }),
  /** Accessible name of the grid (no visible heading between the h1 and the cards, KI-A14). */
  listHeading: z.string(),
  /** The grid's accessible name on a category page. */
  categoryHeading: templateSchema("category"),
  /** Label of the category links (`.kcats`), shown on the category pages (KI-F13). */
  categoriesLabel: z.string(),
  allCategories: z.string(),
  readMore: z.string(),
  loadMore: z.string(),
  /** Cards on arrival, then cards per "Load more" (the original `KB` state: 6, then 3). */
  pageSize: z.number().int().positive(),
  pageStep: z.number().int().positive(),
});
export type BlogListingCopy = z.infer<typeof blogListingCopySchema>;

/** The article page (`#p-article`): breadcrumb, byline, aside and closing line. */
export const articleCopySchema = z.object({
  /** Document title of an article (the original's runtime title, KI-S02). */
  seoTitle: templateSchema("title"),
  breadcrumb: z.string(),
  byline: z.string(),
  latestHeading: z.string(),
  /** Posts in the "Latest articles" aside. */
  latestCount: z.number().int().positive(),
  allArticles: z.string(),
  /** Appended after every body ("Planning a project? Talk to the KATIC team."). */
  closing: z.object({ prompt: z.string(), link: z.string() }),
});
export type ArticleCopy = z.infer<typeof articleCopySchema>;

/** The `/pages/blog` resource. */
export const blogPageSchema = z.object({
  page: blogListingCopySchema,
  article: articleCopySchema,
});
export type BlogPage = z.infer<typeof blogPageSchema>;
