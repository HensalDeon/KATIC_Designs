import type { Metadata } from "next";

import { ReviewsClients } from "@/components/reviews/reviews-clients";
import { ReviewsCta } from "@/components/reviews/reviews-cta";
import { ReviewsExpertise } from "@/components/reviews/reviews-expertise";
import { ReviewsHero } from "@/components/reviews/reviews-hero";
import { ReviewsProjects } from "@/components/reviews/reviews-projects";
import { ReviewsStory } from "@/components/reviews/reviews-story";
import { ReviewsTrust } from "@/components/reviews/reviews-trust";
import { getReviewsPage, getSite } from "@/lib/data";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

/** Fully static: the build fails if anything here starts rendering per request. */
export const ensureStatic = "navigation";

// The original's `data-title` / `data-desc` (the title already ends in the brand).
export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getReviewsPage(), getSite()]);
  return pageMetadata({ path: routes.reviews, ...page.seo }, site);
}

/**
 * Reviews (`#p-reviews`, original lines 4216–4379, docs/analysis/04 §9). Order and tones as the
 * original renders them (1703–1707): hero, trust (white), testimonials (black), expertise (white),
 * featured story with the plant (black), projects (white), then the photo CTA band. The original's
 * sections have no ids, so none are invented (P5-01). No contact section (the CTAs go to Home's
 * form) and no reveal-on-scroll: the original runs it on Home only (D7). The footer comes from the
 * layout.
 */
export default async function ReviewsPage() {
  const page = await getReviewsPage();
  return (
    <>
      <ReviewsHero content={page.hero} />
      <ReviewsTrust content={page.trust} />
      <ReviewsClients content={page.clients} />
      <ReviewsExpertise content={page.expertise} />
      <ReviewsStory content={page.story} />
      <ReviewsProjects content={page.projects} />
      <ReviewsCta content={page.cta} />
    </>
  );
}
