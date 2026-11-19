import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutTeaser } from "@/components/home/about-teaser";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { HomeHero } from "@/components/home/home-hero";
import { NewsTeaser } from "@/components/home/news-teaser";
import { SignatureProject } from "@/components/home/signature-project";

/**
 * Dev-only preview of home sections 0, 1, 2, 7 and 9 (hero, about, signature project, news and
 * blog teasers) in home order, for side-by-side comparison with the original (`#home`). Used by
 * tests/e2e/home-h1.spec.ts. The other home sections are built separately; the home page composes
 * all of them. Disabled in production unless ENABLE_STYLEGUIDE=1.
 */
const ENABLED = process.env.NODE_ENV !== "production" || process.env["ENABLE_STYLEGUIDE"] === "1";

export const metadata: Metadata = {
  title: "Styleguide: home H1",
  robots: { index: false, follow: false },
};

export default function HomeH1StyleguidePage() {
  if (!ENABLED) notFound();

  return (
    <>
      <HomeHero />
      <AboutTeaser />
      <SignatureProject />
      <NewsTeaser />
      <BlogTeaser />
    </>
  );
}
