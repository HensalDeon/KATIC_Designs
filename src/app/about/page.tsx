import type { Metadata } from "next";

import { AboutDivisions, AboutServices } from "@/components/about/about-cards";
import { AboutExperience } from "@/components/about/about-experience";
import { AboutFounder } from "@/components/about/about-founder";
import { AboutHero } from "@/components/about/about-hero";
import { AboutIntro } from "@/components/about/about-intro";
import { AboutPhilosophy } from "@/components/about/about-philosophy";
import { AboutTeam } from "@/components/about/about-team";
import { AboutWorks } from "@/components/about/about-works";
import { ContactSection } from "@/components/sections/contact-section";
import { ABOUT_SEO } from "@/content/about";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

// The original's `data-title` / `data-desc` (the title already ends in the brand).
export const metadata: Metadata = pageMetadata({ path: routes.about, ...ABOUT_SEO });

/**
 * About (`#p-about`). Section order and tones as rendered by the original (docs/analysis/02 §2):
 * white and black alternate after the hero. Sections keep the original ids, so legacy deep links
 * (`#about/about-approach`, `#about/about-founder`) land on `/about#…`. No reveal-on-scroll: the
 * original runs it on Home only (D7). The footer comes from the layout.
 */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutIntro />
      <AboutPhilosophy />
      <AboutServices />
      <AboutDivisions />
      <AboutFounder />
      <AboutExperience />
      <AboutTeam />
      <AboutWorks />
      <ContactSection id="about-contact" tone="light" />
    </>
  );
}
