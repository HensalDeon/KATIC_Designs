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

/**
 * Home (`#p-home`). Section order and tones as rendered by the original
 * (docs/analysis/02 §1): each section owns its tone and keeps the original id, so legacy deep
 * links (`/#home-process`, `/#start`) and the parity tool line up.
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
    </>
  );
}
