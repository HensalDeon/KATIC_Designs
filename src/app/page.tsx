import type { Metadata } from "next";

import { AboutTeaser } from "@/components/home/about-teaser";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { ClientStories } from "@/components/home/client-stories";
import { DivisionsCarousel } from "@/components/home/divisions-carousel";
import { HomeContact } from "@/components/home/home-contact";
import { HomeHero } from "@/components/home/home-hero";
import { NewsTeaser } from "@/components/home/news-teaser";
import { PinnedShowcase } from "@/components/home/pinned-showcase";
import { PinnedStages } from "@/components/home/pinned-stages";
import { ServicesExplorer } from "@/components/home/services-explorer";
import { SignatureProject } from "@/components/home/signature-project";
import { JsonLd } from "@/components/seo/json-ld";
import { getHomePage, getSite, listNews, listPosts } from "@/lib/data";
import { routes } from "@/lib/routes";
import { faqPageLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

/** Posts in the blog teaser (one featured, three listed) and cards in the news teaser. */
const BLOG_TEASER_POSTS = 4;
const NEWS_TEASER_ITEMS = 3;

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getHomePage(), getSite()]);
  return pageMetadata({ path: routes.home, ...page.seo }, site);
}

/**
 * Home (`#p-home`). Section order and tones as rendered by the original
 * (docs/analysis/02 §1): each section owns its tone and keeps the original id, so legacy deep
 * links (`/#home-process`, `/#start`) and the parity tool line up. The FAQPage structured data is
 * the FAQ that `HomeContact` renders (KI-S02: the original emitted it on every page).
 *
 * Content: the page resource (`getHomePage()`), plus the newest posts and news for the teasers.
 */
export default async function HomePage() {
  const [page, posts, news] = await Promise.all([getHomePage(), listPosts(), listNews()]);
  return (
    <>
      <HomeHero content={page.hero} />
      <AboutTeaser content={page.about} />
      <SignatureProject content={page.signature} />
      <ServicesExplorer content={page.explorer} />
      <PinnedShowcase content={page.works} />
      <PinnedStages content={page.process} />
      <DivisionsCarousel content={page.divisions} />
      <NewsTeaser copy={page.newsTeaser} items={news.slice(0, NEWS_TEASER_ITEMS)} />
      <ClientStories content={page.stories} />
      <BlogTeaser copy={page.blogTeaser} posts={posts.slice(0, BLOG_TEASER_POSTS)} />
      <HomeContact content={page.contact} />
      <JsonLd data={faqPageLd(page.contact.faq.items, routes.home)} />
    </>
  );
}
