import type { Metadata } from "next";

import { Capabilities } from "@/components/works/capabilities";
import { FeaturedProject } from "@/components/works/featured-project";
import { Portfolio } from "@/components/works/portfolio";
import { WorksHero } from "@/components/works/works-hero";
import {
  WorksCaseStudy,
  WorksCta,
  WorksDivisions,
  WorksSectors,
} from "@/components/works/works-sections";
import { WORKS_SEO } from "@/content/works";

/**
 * Fully static: the portfolio filter reads `?category=` on the client (inside its own Suspense
 * boundary), so the build fails if anything here starts rendering per request.
 */
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  // The original's title already ends in "| Katic Designs".
  title: { absolute: WORKS_SEO.title },
  description: WORKS_SEO.description,
};

/**
 * Works (`#p-works`, original lines 3604–3781, docs/analysis/04 §1). Order and tones as the
 * original renders them (the `data-fx` swaps make the portfolio and capabilities white): hero,
 * featured project (white), sectors (black), portfolio `#works-list` (white), case study (black),
 * capabilities (white), divisions (black), then the photo CTA band. Works has no contact section
 * (the CTA goes to the home page's form); the footer comes from the layout. No reveal-on-scroll:
 * the original runs it on Home only (D7).
 */
export default function WorksPage() {
  return (
    <>
      <WorksHero />
      <FeaturedProject />
      <WorksSectors />
      <Portfolio />
      <WorksCaseStudy />
      <Capabilities />
      <WorksDivisions />
      <WorksCta />
    </>
  );
}
