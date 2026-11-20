import type { Metadata } from "next";

import { BlockHero } from "@/components/blocks/block-hero";
import { NewsList } from "@/components/news/news-list";
import { getNewsPage, getSite, listNews } from "@/lib/data";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

// The original's `data-title` / `data-desc` (the title already ends in the brand).
export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, site] = await Promise.all([getNewsPage(), getSite()]);
  return pageMetadata({ path: routes.news, ...seo }, site);
}

/**
 * News (`#p-news`, original lines 4048–4053): the `.kh-hero` banner without buttons, then the
 * white news list. No reveal-on-scroll (the original runs it on Home only, D7); the footer comes
 * from the layout and the header highlights no item, as in the original.
 */
export default async function NewsPage() {
  const [page, items] = await Promise.all([getNewsPage(), listNews()]);
  return (
    <>
      <BlockHero hero={page.hero} />
      <NewsList copy={page.list} items={items} />
    </>
  );
}
