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
import { HOME_CONTACT } from "@/content/home/contact";
import { SITE_SEO } from "@/content/site";
import { getSite } from "@/lib/data";
import { routes } from "@/lib/routes";
import { faqPageLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(
    {
      path: routes.home,
      title: SITE_SEO.title,
      description: SITE_SEO.description,
    },
    await getSite(),
  );
}

/**
 * Home (`#p-home`). Section order and tones as rendered by the original
 * (docs/analysis/02 §1): each section owns its tone and keeps the original id, so legacy deep
 * links (`/#home-process`, `/#start`) and the parity tool line up. The FAQPage structured data is
 * the FAQ that `HomeContact` renders (KI-S02: the original emitted it on every page).
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />
      <AboutTeaser />
      <SignatureProject />
      <ServicesExplorer />
      <PinnedShowcase />
      <PinnedStages />
      <DivisionsCarousel />
      <NewsTeaser />
      <ClientStories />
      <BlogTeaser />
      <HomeContact />
      <JsonLd data={faqPageLd(HOME_CONTACT.faq.items, routes.home)} />
    </>
  );
}
