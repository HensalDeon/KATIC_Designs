import type { Metadata } from "next";

import { ContactSection } from "@/components/sections/contact-section";
import { ServiceBlock } from "@/components/services-page/service-block";
import { ServicesHero } from "@/components/services-page/services-hero";
import { WhatWeDeliver } from "@/components/services-page/what-we-deliver";
import { WhatWeDo } from "@/components/services-page/what-we-do";
import { getRefs, getServicesPage, getSite } from "@/lib/data";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

// The original's `data-title` / `data-desc` (the title already ends in the brand).
export async function generateMetadata(): Promise<Metadata> {
  const [{ seo }, site] = await Promise.all([getServicesPage(), getSite()]);
  return pageMetadata({ path: routes.services, ...seo }, site);
}

/**
 * Services overview (`#p-services`, docs/analysis/02 §3). Order and tones as rendered by the
 * original: hero, "What we do" (white), "What we deliver" (black), the seven service blocks
 * alternating white/black with the images alternating right/left, then the black contact section.
 * Blocks keep the original ids (`/services#svc-turnkey`); like every page but Home, nothing reveals
 * on scroll (D7). Only the architecture photo has the inner parallax (E25). The hero's index lists
 * the blocks' services, in page order.
 */
export default async function ServicesPage() {
  const [page, refs] = await Promise.all([getServicesPage(), getRefs()]);
  return (
    <>
      <ServicesHero
        content={page.hero}
        services={refs.relatedServices(page.blocks.map((block) => block.slug))}
      />
      <WhatWeDo content={page.whatWeDo} />
      <WhatWeDeliver content={page.whatWeDeliver} />
      {page.blocks.map((block) => (
        <ServiceBlock key={block.slug} block={block} parallax={block.slug === "architecture"} />
      ))}
      <ContactSection id="services-contact" tone="dark" />
    </>
  );
}
