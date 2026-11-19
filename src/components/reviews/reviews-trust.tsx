import { ZoomableImage } from "@/components/overlays/lightbox";
import { resolveImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { REVIEWS_TRUST, type ReviewsTrustContent } from "@/content/reviews";

import { ReviewsHeading } from "./reviews-ui";

/**
 * "Built on trust" (`#p-reviews section.tr`, markup 4297–4307, page `<style>` 4225–4235): heading,
 * a 14.5/1.9 paragraph and "About Katic" on the left; on the canvas the 678 × 571 photo sits at the
 * top right of the content block, with the dark "SPACES MADE PERSONAL" caption box over its lower
 * right corner. At least `max(830px, one screen)` tall. Below 1100px the photo follows the text at
 * full width. The photo opens the lightbox, as the original's `.tr .im img[data-zoom]`. White.
 *
 * Fixes: the caption label is 11px on phones (KI-A10); the photo's alt describes it (KI-A13).
 */
export function ReviewsTrust({
  content = REVIEWS_TRUST,
}: {
  readonly content?: ReviewsTrustContent;
}) {
  return (
    <Section tone="light" data-parity="tr" className="lg:min-h-[max(830px,var(--svh))]">
      <Container>
        <ReviewsHeading kicker={content.kicker} title={content.title} />
        <p className="mt-22 max-w-520 font-sans text-[14.5px] leading-[1.9] text-fg-mut">
          {content.text}
        </p>
        <ButtonLink
          href={content.cta.href}
          variant="outline"
          size="sm"
          icon="up-right"
          className="mt-46"
        >
          {content.cta.label}
        </ButtonLink>

        <div className="absolute top-0 right-0 h-571 w-678 max-lg:relative max-lg:mt-40 max-lg:w-full">
          <ZoomableImage
            image={resolveImage(content.image.src)}
            alt={content.image.alt}
            fill
            // The 571px-tall box crops a 3:2 photo, so it is drawn ~857px wide at every width.
            sizes={canvasSizes(857, "calc(100vw - 72px)", "857px")}
            className="object-cover"
            buttonClassName="relative size-full"
          />
          {/* The label is inline, as in the original, so its line keeps the Jost strut height. */}
          <div className="pointer-events-none absolute right-24 bottom-26 w-250 bg-[rgba(20,20,20,0.9)] px-18 py-16">
            <p>
              <small className="font-sans text-[9px] font-medium tracking-[0.2em] text-brand max-md:text-[11px]">
                {content.caption.label}
              </small>
            </p>
            <p className="mt-8 font-sans text-[11px] leading-[1.6] text-[#ddd]">
              {content.caption.text}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
