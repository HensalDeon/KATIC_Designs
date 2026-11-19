import { BlockHero } from "@/components/blocks/block-hero";
import { BlockStack } from "@/components/blocks/block-stack";
import { ContactFaq } from "@/components/sections/contact-faq";
import type { ServicePageContent } from "@/content/service-pages";

import { ARCH_TITLE } from "./arch/arch-header";
import { contactSectionId } from "./page-plan";
import { BespokeSectionView } from "./service-section";

type ServicePageProps = {
  readonly content: ServicePageContent;
};

/** Title classes per page leading; `relaxed` is architecture's `#p-architecture .st` (1.14). */
const TITLE_LEADING = { standard: undefined, relaxed: ARCH_TITLE } as const;

/**
 * A service detail page (`#p-<slug>`, docs/analysis/03): the banner (`BlockHero`), the page's
 * sections in order with white/black alternating after the hero (`BlockStack`), then the contact +
 * FAQ section in the opposite tone of the last one, under the original's `<slug>-contact` id.
 * Server component: only the section library's islands hydrate (line-art draw-on, lightbox, FAQ
 * accordion, enquiry form). Like every page but Home, nothing reveals on scroll (D7).
 */
export function ServicePage({ content }: ServicePageProps) {
  const { hero, contact } = content;
  const contactId = contactSectionId(content.slug);
  const titleClassName = TITLE_LEADING[content.sectionTitleLeading ?? "standard"];
  const context = {
    contactHref: `#${contactId}`,
    ...(titleClassName ? { titleClassName } : {}),
  };

  return (
    <>
      <BlockHero hero={hero} contactHref={context.contactHref} />
      <BlockStack
        blocks={content.sections}
        context={context}
        renderBespoke={(section, { tone }) => (
          <BespokeSectionView section={section} tone={tone} context={context} />
        )}
        ending={(tone) => (
          <ContactFaq
            tone={tone}
            id={contactId}
            heading={contact.heading}
            lead={contact.lead}
            form={contact.form}
            faq={contact.faq}
            {...(contact.plant ? { plant: contact.plant } : {})}
          />
        )}
      />
    </>
  );
}
