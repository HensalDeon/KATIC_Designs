import type { Metadata } from "next";

import { ReviewsClients } from "@/components/reviews/reviews-clients";
import { ReviewsCta } from "@/components/reviews/reviews-cta";
import { ReviewsExpertise } from "@/components/reviews/reviews-expertise";
import { ReviewsHero } from "@/components/reviews/reviews-hero";
import { ReviewsProjects } from "@/components/reviews/reviews-projects";
import { ReviewsStory } from "@/components/reviews/reviews-story";
import { ReviewsTrust } from "@/components/reviews/reviews-trust";
import { REVIEWS_SEO } from "@/content/reviews";

/** Fully static: the build fails if anything here starts rendering per request. */
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  // The original's title already ends in "| Katic Designs".
  title: { absolute: REVIEWS_SEO.title },
  description: REVIEWS_SEO.description,
};

/**
 * Reviews (`#p-reviews`, original lines 4216–4379, docs/analysis/04 §9). Order and tones as the
 * original renders them (1703–1707): hero, trust (white), testimonials (black), expertise (white),
 * featured story with the plant (black), projects (white), then the photo CTA band. The original's
 * sections have no ids, so none are invented (P5-01). No contact section (the CTAs go to Home's
 * form) and no reveal-on-scroll: the original runs it on Home only (D7). The footer comes from the
 * layout.
 */
export default function ReviewsPage() {
  return (
    <>
      <ReviewsHero />
      <ReviewsTrust />
      <ReviewsClients />
      <ReviewsExpertise />
      <ReviewsStory />
      <ReviewsProjects />
      <ReviewsCta />
    </>
  );
}
