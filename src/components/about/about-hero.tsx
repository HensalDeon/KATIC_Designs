import Image from "next/image";

import { TitleLines } from "@/components/home/title-lines";
import { resolveImage } from "@/components/sections/section-image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroTitle } from "@/components/ui/heading";
import type { AboutHeroContent } from "@/content/about";
import { cn } from "@/lib/cn";

/** Hero buttons (`#p-about .hero .btns .btn`): 50px, Inter 500 13px; full width on phones. */
const BUTTON =
  "h-50 gap-20 px-24 text-[13px] max-md:flex max-md:w-full max-md:justify-between max-md:px-20 max-md:text-[12px]";

type AboutHeroProps = {
  readonly content: AboutHeroContent;
};

/**
 * About hero (`#p-about .hero`): full-bleed photo under a left-to-right shade, the Jost eyebrow
 * with its orange rule, the 76/.98 title with an orange last line, the lead and two link buttons.
 * One screen tall (at least 720px) on the canvas, at least one screen below 1100px; on phones the
 * content sits at the bottom and the buttons stack full width. Marked `data-hero` for the phone
 * quick-contact bar.
 *
 * Fixes: the title scales to 62px below 1100px (KI-L16, `HeroTitle`); the two decorative corner
 * labels (`.vl`) read bottom-to-top instead of upside down (KI-L15, vertical writing mode) and are
 * hidden from assistive tech.
 */
export function AboutHero({ content }: AboutHeroProps) {
  const titleId = "about-hero-title";
  const [leftLabel, rightLabel] = content.labels;
  return (
    <section
      data-hero
      data-tone="dark"
      aria-labelledby={titleId}
      className={cn(
        "relative h-[max(var(--svh),720px)] overflow-hidden bg-ink-2 pt-[max(0px,calc((var(--svh)_-_720px)/2))] text-white",
        "max-lg:h-auto max-lg:min-h-svh max-lg:pt-0",
        "max-md:flex max-md:flex-col max-md:justify-end max-md:pb-40",
      )}
    >
      <div className="absolute inset-0">
        <Image
          src={resolveImage(content.image.src)}
          alt={content.image.alt}
          preload
          fetchPriority="high"
          sizes="100vw"
          className="size-full object-cover"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.35))] max-md:bg-[linear-gradient(0deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.28)_100%)]"
      />

      <Container className="z-2 pt-168 max-md:pt-110">
        <p className="flex items-center gap-12 font-display text-[12.5px] text-mist before:h-1 before:w-22 before:flex-none before:bg-brand before:content-['']">
          {content.kicker}
        </p>
        <HeroTitle id={titleId} className="mt-22 leading-[0.98] max-md:mt-14">
          <TitleLines lines={content.title} />
        </HeroTitle>
        <p className="mt-22 max-w-640 font-display text-[16px] leading-[1.75] text-white max-md:mt-16 max-md:max-w-none max-md:text-[15px] max-md:leading-[1.6]">
          {content.lead}
        </p>
        <div className="mt-22 flex gap-20 max-md:mt-24 max-md:flex-col max-md:items-stretch max-md:gap-10">
          <ButtonLink
            href={content.primaryCta.href}
            variant="light"
            size="base"
            icon="up-right"
            className={BUTTON}
          >
            {content.primaryCta.label}
          </ButtonLink>
          <ButtonLink
            href={content.secondaryCta.href}
            variant="outline-light"
            size="base"
            icon="up-right"
            className={BUTTON}
          >
            {content.secondaryCta.label}
          </ButtonLink>
        </div>
      </Container>

      <VerticalLabel className="left-36">{leftLabel}</VerticalLabel>
      <VerticalLabel className="right-58">{rightLabel}</VerticalLabel>
    </section>
  );
}

/** Decorative corner label (`.vl`), set vertically and read bottom-to-top (KI-L15). */
function VerticalLabel({ className, children }: { className: string; children: string }) {
  return (
    <span
      aria-hidden
      data-vertical-label
      className={cn(
        "absolute bottom-22 z-3 rotate-180 font-sans text-[9px] font-medium tracking-[0.24em] whitespace-nowrap text-[#bbb] [writing-mode:vertical-rl] max-md:hidden",
        className,
      )}
    >
      {children}
    </span>
  );
}
