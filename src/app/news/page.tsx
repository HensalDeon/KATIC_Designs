import type { Metadata } from "next";

import { BlockHero } from "@/components/blocks/block-hero";
import { NewsList } from "@/components/news/news-list";
import { NEWS_PAGE, NEWS_SEO } from "@/content/news";

export const metadata: Metadata = {
  // The original's title already ends in "| Katic Designs".
  title: { absolute: NEWS_SEO.title },
  description: NEWS_SEO.description,
};

/**
 * News (`#p-news`, original lines 4048–4053): the `.kh-hero` banner without buttons, then the
 * white news list. No reveal-on-scroll (the original runs it on Home only, D7); the footer comes
 * from the layout and the header highlights no item, as in the original.
 */
export default function NewsPage() {
  return (
    <>
      <BlockHero hero={NEWS_PAGE.hero} />
      <NewsList />
    </>
  );
}
