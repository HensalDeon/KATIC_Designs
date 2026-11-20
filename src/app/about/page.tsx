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
import { getAboutPage, getSite } from "@/lib/data";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

// The original's `data-title` / `data-desc` (the title already ends in the brand).
export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getAboutPage(), getSite()]);
  return pageMetadata({ path: routes.about, ...page.seo }, site);
}

/**
 * About (`#p-about`). Section order and tones as rendered by the original (docs/analysis/02 §2):
 * white and black alternate after the hero. Sections keep the original ids, so legacy deep links
 * (`#about/about-approach`, `#about/about-founder`) land on `/about#…`. No reveal-on-scroll: the
 * original runs it on Home only (D7). The footer comes from the layout.
 *
 * Content: the page resource (`getAboutPage()`); the contact section uses the shared template.
 */
export default async function AboutPage() {
  const page = await getAboutPage();
  return (
    <>
      <AboutHero content={page.hero} />
      <AboutIntro content={page.intro} />
      <AboutPhilosophy philosophy={page.philosophy} approach={page.approach} />
      <AboutServices content={page.services} />
      <AboutDivisions content={page.divisions} />
      <AboutFounder content={page.founder} />
      <AboutExperience content={page.experience} />
      <AboutTeam content={page.team} />
      <AboutWorks content={page.works} />
      <ContactSection id="about-contact" tone="light" />
    </>
  );
}
