import { BlockHero } from "@/components/blocks/block-hero";
import { BlockStack } from "@/components/blocks/block-stack";
import { ContactSection } from "@/components/sections/contact-section";
import { INDIA_PAGE, type IndiaPageContent } from "@/content/locations/india";

import { IndiaProjects } from "./india-projects";

type IndiaPageProps = {
  readonly content?: IndiaPageContent;
};

/**
 * The India location page (`#p-india`, original lines 4071–4096, docs/analysis/04 §7), a pure
 * block page: banner, then intro split (white), locations (black), services with the hanging plant
 * (white), divisions (black), the filterable projects `#india-projects` (white), why KATIC (black)
 * and approach (white), closed by the contact section (black, `#india-contact`). Server component:
 * only the section islands hydrate (lightbox, line-art draw-on, project filter, enquiry form). No
 * reveal-on-scroll, as in the original (D7).
 */
export function IndiaPage({ content = INDIA_PAGE }: IndiaPageProps) {
  const { hero, contact } = content;
  const contactHref = `#${contact.id}`;
  return (
    <>
      <BlockHero hero={hero} contactHref={contactHref} />
      <BlockStack
        blocks={content.blocks}
        context={{ contactHref }}
        renderBespoke={(block, { tone }) => <IndiaProjects block={block} tone={tone} />}
        ending={(tone) => <ContactSection id={contact.id} tone={tone} content={contact} />}
      />
    </>
  );
}
