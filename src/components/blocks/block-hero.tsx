import { PageHero } from "@/components/sections/page-hero";
import type { PageHeroContent } from "@/content/blocks";

import { withContactTarget } from "./block-plan";
import { AccentTitleText } from "./title-text";

type BlockHeroProps = {
  readonly hero: PageHeroContent;
  /** `#<id>` of the page's own enquiry form, the no-JavaScript target of "go to contact" CTAs. */
  readonly contactHref?: string;
};

/**
 * The banner of a block page (`.hero.kh-hero` or the architecture variant) from its content: the
 * `PageHero` with the accent title and the CTAs pointed at the page's form when it has one.
 */
export function BlockHero({ hero, contactHref }: BlockHeroProps) {
  return (
    <PageHero
      image={hero.image}
      kicker={hero.kicker}
      title={<AccentTitleText title={hero.title} />}
      {...(hero.variant ? { variant: hero.variant } : {})}
      {...(hero.lead ? { lead: hero.lead } : {})}
      {...(hero.primaryCta ? { primaryCta: withContactTarget(hero.primaryCta, contactHref) } : {})}
      {...(hero.secondaryCta
        ? { secondaryCta: withContactTarget(hero.secondaryCta, contactHref) }
        : {})}
      {...(hero.caption ? { caption: hero.caption } : {})}
    />
  );
}
