import { ContactFaq } from "@/components/sections/contact-faq";
import { PageHero } from "@/components/sections/page-hero";
import type { ServicePageContent } from "@/content/service-pages";

import { planServicePage, withContactTarget } from "./page-plan";
import { ServiceSectionView } from "./service-section";
import { AccentTitleText } from "./title-text";

type ServicePageProps = {
  readonly content: ServicePageContent;
};

/**
 * A service detail page (`#p-<slug>`, docs/analysis/03): the banner (`PageHero`), the page's
 * sections in order with white/black alternating after the hero (`planServicePage`), then the
 * contact + FAQ section in the opposite tone of the last one, under the original's
 * `<slug>-contact` id. Server component: only the section library's islands hydrate (line-art
 * draw-on, lightbox, FAQ accordion, enquiry form). Like every page but Home, nothing reveals on
 * scroll (D7).
 */
export function ServicePage({ content }: ServicePageProps) {
  const plan = planServicePage(content);
  const { hero, contact } = content;

  return (
    <>
      <PageHero
        image={hero.image}
        kicker={hero.kicker}
        title={<AccentTitleText title={hero.title} />}
        {...(hero.variant ? { variant: hero.variant } : {})}
        {...(hero.lead ? { lead: hero.lead } : {})}
        {...(hero.primaryCta
          ? { primaryCta: withContactTarget(hero.primaryCta, plan.contact.id) }
          : {})}
        {...(hero.secondaryCta
          ? { secondaryCta: withContactTarget(hero.secondaryCta, plan.contact.id) }
          : {})}
        {...(hero.caption ? { caption: hero.caption } : {})}
      />
      {plan.sections.map(({ section, tone, key }) => (
        <ServiceSectionView key={key} section={section} tone={tone} contactId={plan.contact.id} />
      ))}
      <ContactFaq
        tone={plan.contact.tone}
        id={plan.contact.id}
        heading={contact.heading}
        lead={contact.lead}
        form={contact.form}
        faq={contact.faq}
        {...(contact.plant ? { plant: contact.plant } : {})}
      />
    </>
  );
}
