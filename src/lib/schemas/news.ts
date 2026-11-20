import { z } from "zod";

import { NEWS_CATEGORIES } from "@/content/news";

import { pageHeroSchema } from "./blocks";
import { isoDateSchema } from "./posts";
import { mediaIdSchema, oneOf, titleLinesSchema } from "./primitives";

/**
 * Studio news (`GET /news`, `GET /pages/news`): the `.knw` cards of Home and `/news`, and the copy of
 * the news page. The original has no news detail pages (KI-F11).
 */

export const newsCategorySchema = oneOf(NEWS_CATEGORIES);

export const newsItemSchema = z.object({
  /** Permalink anchor on `/news` (`/news#<slug>`). */
  slug: z.string().min(1),
  title: z.string(),
  excerpt: z.string(),
  category: newsCategorySchema,
  date: isoDateSchema,
  image: mediaIdSchema,
  /** Shown as the large lead card on `/news` (`.knw.big`). */
  featured: z.boolean().exactOptional(),
});
export type NewsItem = z.infer<typeof newsItemSchema>;

/** The `/pages/news` resource. */
export const newsPageSchema = z.object({
  /** `data-title` / `data-desc` of `#p-news` (the title already ends in the brand). */
  seo: z.object({ title: z.string(), description: z.string() }),
  hero: pageHeroSchema,
  list: z.object({
    /** Section id (`#news-list`). */
    id: z.string().min(1),
    kicker: z.string(),
    title: titleLinesSchema,
    /**
     * The lead around the studio email address, which becomes a mailto link (plain text in the
     * original, docs/analysis/04 §14.8).
     */
    lead: z.object({ before: z.string(), after: z.string() }),
    readMore: z.string(),
    /** Shown when there is no news (docs/analysis/04 §14.37). */
    empty: z.string(),
  }),
});
export type NewsPage = z.infer<typeof newsPageSchema>;
export type NewsListCopy = NewsPage["list"];
