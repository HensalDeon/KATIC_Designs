import Image from "next/image";

import { TitleLines } from "@/components/home/title-lines";
import { resolveImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Plant } from "@/components/ui/plant";
import { Section } from "@/components/ui/section";
import { ABOUT_INTRO, type AboutIntroContent } from "@/content/about";
import { cn } from "@/lib/cn";

import { ABOUT_TITLE_CLASS, AboutColumns } from "./about-columns";

type AboutIntroProps = {
  readonly content?: AboutIntroContent;
};

/**
 * "Who we are" (`#p-about section.i1`): kicker and title beside a large lead, a paragraph and
 * "Meet the Founder", then a row of two photos and the cream studio card (340 / 641 / 238px).
 * Two columns below 1100px (the card spans both), one on phones. A croton plant stands in the
 * bottom-right corner, in front of the content.
 *
 * Fixes: the section grows with its content instead of being zoomed down to one screen (KI-L13,
 * D4); the plant keeps its aspect ratio (KI-L08); image alts describe the photos (KI-A13).
 */
export function AboutIntro({ content = ABOUT_INTRO }: AboutIntroProps) {
  const titleId = "about-intro-title";
  const [small, large] = content.images;
  return (
    <Section tone="light" data-parity="i1" aria-labelledby={titleId}>
      <Container>
        <AboutColumns
          start={
            <>
              <Kicker>{content.kicker}</Kicker>
              <SectionTitle id={titleId} className={cn("mt-22 text-ink", ABOUT_TITLE_CLASS)}>
                <TitleLines lines={content.title} />
              </SectionTitle>
            </>
          }
          endClassName="pt-6"
          end={
            <>
              <p className="font-sans text-[19.5px] leading-[1.55] text-ink-2 max-md:text-[15px]">
                {content.lead}
              </p>
              <p className="mt-18 font-sans text-[14.5px] leading-[1.9] text-[#666]">
                {content.body}
              </p>
              <ButtonLink
                href={content.cta.href}
                variant="outline"
                size="sm"
                icon="up-right"
                className="mt-22"
              >
                {content.cta.label}
              </ButtonLink>
            </>
          }
        />

        <div className="mt-62 grid grid-cols-[340px_641px_238px] items-start gap-24 max-lg:grid-cols-2 max-md:grid-cols-1">
          <Image
            src={resolveImage(small.src)}
            alt={small.alt}
            sizes={canvasSizes(340, "50vw")}
            className="h-287 w-full object-cover"
          />
          <Image
            src={resolveImage(large.src)}
            alt={large.alt}
            sizes={canvasSizes(641, "50vw")}
            className="h-391 w-full object-cover"
          />
          <div className="flex h-287 flex-col bg-[#f4f2ed] px-24 pt-28 max-lg:col-span-full">
            <p className="font-sans text-[9px] font-medium tracking-[0.22em] text-[#ad4517] max-md:text-[11px]">
              {content.studio.label}
            </p>
            <p className="mt-42 font-sans text-[22px] leading-[1.3] text-ink">
              {content.studio.text}
            </p>
            <p className="mt-auto mb-26 font-sans text-[10.5px] text-[#555] max-md:text-[11px]">
              {content.studio.places}
            </p>
          </div>
        </div>
      </Container>
      <Plant
        asset="plants/croton"
        corner="bottom-right"
        width={200}
        className="right-40 -bottom-4 max-md:right-6"
      />
    </Section>
  );
}
