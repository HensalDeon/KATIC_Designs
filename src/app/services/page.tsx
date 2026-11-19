import type { Metadata } from "next";

import { ContactSection } from "@/components/sections/contact-section";
import { ServiceBlock } from "@/components/services-page/service-block";
import { ServicesHero } from "@/components/services-page/services-hero";
import { WhatWeDeliver } from "@/components/services-page/what-we-deliver";
import { WhatWeDo } from "@/components/services-page/what-we-do";
import { SERVICE_BLOCKS, SERVICES_PAGE_SEO } from "@/content/services-page";

export const metadata: Metadata = {
  title: { absolute: SERVICES_PAGE_SEO.title },
  description: SERVICES_PAGE_SEO.description,
};

/**
 * Services overview (`#p-services`, docs/analysis/02 §3). Order and tones as rendered by the
 * original: hero, "What we do" (white), "What we deliver" (black), the seven service blocks
 * alternating white/black with the images alternating right/left, then the black contact section.
 * Blocks keep the original ids (`/services#svc-turnkey`); like every page but Home, nothing reveals
 * on scroll (D7). Only the architecture photo has the inner parallax (E25).
 */
export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <WhatWeDo />
      <WhatWeDeliver />
      {SERVICE_BLOCKS.map((block) => (
        <ServiceBlock key={block.slug} block={block} parallax={block.slug === "architecture"} />
      ))}
      <ContactSection id="services-contact" tone="dark" />
    </>
  );
}
