import { Fragment } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { Lead } from "@/components/ui/text";
import { type DivisionsCarouselContent, HOME_DIVISIONS } from "@/content/home/divisions";
import { media } from "@/content/media";

import { DivisionsCarouselBody } from "./divisions-carousel-client";

type DivisionsCarouselProps = {
  readonly content?: DivisionsCarouselContent;
  readonly className?: string;
};

/**
 * Home divisions carousel (original `section.ks.dvs.dvx#home-divisions`, E28). Always white, as
 * rendered.
 *
 * A `.kh` header (646px title column; lead and the dark-outline "About Our Divisions" button
 * bottom-aligned on the right; one column below 1100px) above a row of two equal columns 12px
 * apart: the photo and a bordered white card. On the canvas the row fills the rest of the screen
 * (min 480px); it is 560px at 861–1099px; on phones the photo is 4:3.2 above the card.
 *
 * Fixes: at 861–1099px the description sits on the left above the prev/next row instead of under
 * the buttons (KI-L03); on tablets and phones the card height follows its tallest slide instead of
 * `clamp(440px, 118vw, 540px)` (KI-L30). The kicker uses the text-safe orange on white (KI-A11).
 */
export function DivisionsCarousel({ content = HOME_DIVISIONS, className }: DivisionsCarouselProps) {
  return (
    <Section tone="light" id="home-divisions" spacing="home" className={className}>
      <Container data-part="wrap" className="lg:flex lg:flex-1 lg:flex-col">
        <div
          data-part="kh"
          className="grid grid-cols-[646px_minmax(0,1fr)] items-end max-lg:grid-cols-1 max-lg:gap-28"
        >
          <div>
            <Kicker font="home">{content.kicker}</Kicker>
            <SectionTitle scale="home" className="mt-22">
              {content.titleLines.map((line, i) => (
                <Fragment key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </SectionTitle>
          </div>
          <div>
            <Lead variant="home" className="max-w-600">
              {content.lead}
            </Lead>
            <ButtonLink
              href={content.cta.href}
              variant="outline-ink"
              size="section"
              font="home"
              icon="up-right"
              className="mt-22"
            >
              {content.cta.label}
            </ButtonLink>
          </div>
        </div>
        <DivisionsCarouselBody
          slides={content.slides.map((slide) => ({ ...slide, image: media[slide.image].image }))}
          label={content.label}
          exploreLabel={content.exploreLabel}
        />
      </Container>
    </Section>
  );
}
