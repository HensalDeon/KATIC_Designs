import { TitleLines } from "@/components/home/title-lines";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { ProcessSteps } from "@/components/sections/process-steps";
import { SectionHeader } from "@/components/sections/section-header";
import { resolveImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import type { AboutApproachContent, AboutPhilosophyContent } from "@/content/about";
import { cn } from "@/lib/cn";

import { ABOUT_TITLE_CLASS } from "./about-columns";

type AboutPhilosophyProps = {
  readonly philosophy: AboutPhilosophyContent;
  readonly approach: AboutApproachContent;
};

/**
 * Philosophy + approach (`#p-about section.ph#about-philosophy` with the nested
 * `div.ip#about-approach`), one black section:
 *
 * - Philosophy: kicker and title, then a 760px photo that drifts with the scroll (E25,
 *   `ParallaxImage variant="inner"`) with its caption, beside a lead, a paragraph, five outline
 *   tags and "Our Approach".
 * - Approach (`#about-approach`, deep-linked from the hero): the standard `.kh` header and the
 *   five-stage `ProcessSteps` timeline with its line-art draw-on.
 *
 * Fix: the approach header is the two-column `.kh` used everywhere else; the original left it
 * unstyled (stacked, with a 122px gap above the button) because it sits outside a `.ks` (KI-L14).
 * One column below 1100px.
 */
export function AboutPhilosophy({ philosophy, approach }: AboutPhilosophyProps) {
  const titleId = "about-philosophy-title";
  return (
    <Section
      tone="dark"
      id="about-philosophy"
      spacing="none"
      aria-labelledby={titleId}
      className="pt-120 max-lg:pt-80"
    >
      <Container>
        <Kicker>{philosophy.kicker}</Kicker>
        <SectionTitle id={titleId} className={cn("mt-28", ABOUT_TITLE_CLASS)}>
          {philosophy.title}
        </SectionTitle>
        <div className="mt-60 grid grid-cols-[760px_1fr] gap-52 max-lg:grid-cols-1 max-lg:gap-36">
          <div className="relative">
            <ParallaxImage
              variant="inner"
              src={resolveImage(philosophy.image.src)}
              alt={philosophy.image.alt}
              sizes={canvasSizes(760, "calc(100vw - 72px)", "calc(100vw - 40px)")}
              frameClassName="h-450"
            />
            <p className="absolute top-16 left-28 font-sans text-[9px] tracking-[0.28em] text-[#ddd] uppercase max-md:text-[11px]">
              {philosophy.caption}
            </p>
          </div>
          <div>
            <p className="font-sans text-[19.5px] leading-[1.5] font-medium text-white max-md:text-[15px]">
              {philosophy.lead}
            </p>
            <p className="mt-24 font-sans text-[14px] leading-[1.9] text-[#9a958e]">
              {philosophy.body}
            </p>
            <ul className="mt-22 flex max-w-450 flex-wrap gap-x-13 gap-y-12">
              {philosophy.tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex h-32 items-center border border-[rgba(255,255,255,0.3)] px-13 font-sans text-[9.5px] tracking-[0.14em] text-[#ddd] max-md:text-[11px]"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <ButtonLink
              href={philosophy.cta.href}
              variant="dark"
              size="base"
              icon="up-right"
              className="mt-122 gap-22 px-24"
            >
              {philosophy.cta.label}
            </ButtonLink>
          </div>
        </div>
      </Container>

      <div id="about-approach" className="py-120">
        <Container>
          <SectionHeader
            kicker={approach.kicker}
            title={<TitleLines lines={approach.title} />}
            lead={approach.lead}
            cta={approach.cta}
            className="max-md:[&_h2]:leading-[1.12]"
          />
          <ProcessSteps steps={approach.steps} className="mt-60" />
        </Container>
      </div>
    </Section>
  );
}
