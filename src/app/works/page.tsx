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
import { getSite } from "@/lib/data";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

/**
 * Fully static: the portfolio filter reads `?category=` on the client (inside its own Suspense
 * boundary), so the build fails if anything here starts rendering per request.
 */
export const ensureStatic = "navigation";

// The original's `data-title` / `data-desc` (the title already ends in the brand).
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: routes.works, ...WORKS_SEO }, await getSite());
}

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
