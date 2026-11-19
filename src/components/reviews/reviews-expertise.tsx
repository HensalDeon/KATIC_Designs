import Image from "next/image";
import Link from "next/link";

import { ServiceIcon } from "@/components/icons/service-icon";
import { resolveImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { REVIEWS_EXPERTISE, type ReviewsExpertiseContent } from "@/content/reviews";
import { routes } from "@/lib/routes";

import { ReviewsHeading, SplitHeader } from "./reviews-ui";

/**
 * "Experience across every discipline" (`#p-reviews section.xp`, markup 4324–4334, page `<style>`
 * 4247–4257): header row with "Explore Services", then four discipline cards (292px photo with a
 * dark icon square, 22.5px title over a rule with an orange ↗, 13/1.8 text), each opening its
 * service page. Photos zoom to 1.05 on hover (.8s). Four columns; two below 1100px (28px row gap);
 * one on phones. White.
 *
 * Fixes: alts describe the photos instead of repeating the title with "↗" (KI-A13); the ↗ is
 * decorative and hidden from assistive tech.
 */
export function ReviewsExpertise({
  content = REVIEWS_EXPERTISE,
}: {
  readonly content?: ReviewsExpertiseContent;
}) {
  return (
    <Section tone="light" data-parity="xp">
      <Container>
        <SplitHeader
          align="end"
          aside={
            <ButtonLink
              href={content.cta.href}
              variant="outline"
              size="sm"
              icon="up-right"
              className="mb-6"
            >
              {content.cta.label}
            </ButtonLink>
          }
        >
          <ReviewsHeading kicker={content.kicker} title={content.title} />
        </SplitHeader>

        <ul className="mt-50 grid grid-cols-4 gap-24 max-lg:grid-cols-2 max-lg:gap-y-28 max-md:grid-cols-1">
          {content.cards.map((card) => (
            <li key={card.service}>
              <Link href={routes.service(card.service)} className="group block">
                <div className="relative h-292 overflow-hidden">
                  <Image
                    src={resolveImage(card.image.src)}
                    alt={card.image.alt}
                    fill
                    sizes={canvasSizes(299, "calc(50vw - 48px)", "calc(100vw - 40px)")}
                    className="object-cover transition-transform duration-800 group-hover:scale-105"
                  />
                  <span className="absolute top-14 left-14 grid size-34 place-items-center bg-[#141414] text-white">
                    <ServiceIcon name={card.icon} size={20} />
                  </span>
                </div>
                <h3 className="mt-22 flex justify-between border-b border-[#ddd] pb-16 font-sans text-[22.5px] font-normal">
                  {card.title}
                  <i aria-hidden className="text-[13px] text-brand not-italic">
                    ↗
                  </i>
                </h3>
                <p className="mt-14 font-sans text-[13px] leading-[1.8] text-fg-body">
                  {card.text}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
