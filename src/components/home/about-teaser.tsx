import Image from "next/image";

import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { Lead } from "@/components/ui/text";
import { HOME_ABOUT, type HomeAboutContent, type HomeStat } from "@/content/home/about";
import { media } from "@/content/media";
import { cn } from "@/lib/cn";
import { fixedCanvasSizes } from "@/lib/media/sizes";
import { routes } from "@/lib/routes";

import { LogoMarquee } from "./logo-marquee";
import { RichTextRuns, TitleLines } from "./title-lines";
import { ValueIcon } from "./value-icon";

type AboutTeaserProps = {
  readonly content?: HomeAboutContent;
};

/** Hairline used above the kicker and under the "EST." line (`.topline`, `.estline`). */
const HAIRLINE = "h-1 bg-[#e3e0da]";

/**
 * Stat cell borders: dividers between the four columns on the canvas and tablets; on phones a
 * 2×2 grid where the second row gets a top rule and only the right column a left rule.
 */
const STAT_CELL = [
  "",
  "border-l pl-16",
  "border-l pl-16 max-md:border-t max-md:border-l-0 max-md:pl-0",
  "border-l pl-16 max-md:border-t",
] as const;

function StatValue({ stat }: { readonly stat: HomeStat }) {
  return (
    <b className="block font-display text-[32px] leading-[32px] font-normal text-ink-2">
      {typeof stat.value === "number" ? <CountUp to={stat.value} /> : stat.value}
      {stat.suffix ? <em className="text-brand not-italic">{stat.suffix}</em> : null}
    </b>
  );
}

/**
 * Home about teaser (`section.ab#home-about`): hairline, kicker, then two columns (608px / rest on
 * the canvas, stacked below 1100px). Left: the clipped-in title, "EST." line, two leads, the
 * partner `LogoMarquee` and "About Us". Right: four stats that count up (E17) and the five values
 * with their line icons. A bougainvillea hangs top-right (behind the text on phones). Every block
 * the original lists in its reveal map (E16) reveals on scroll.
 */
export function AboutTeaser({ content = HOME_ABOUT }: AboutTeaserProps) {
  return (
    <Section
      tone="light"
      spacing="home"
      id="home-about"
      aria-labelledby="home-about-title"
      className="isolate text-ink"
    >
      <Image
        src={media["plants/bougainvillea"].image}
        alt=""
        aria-hidden
        sizes={fixedCanvasSizes(171)}
        className="pointer-events-none absolute top-0 right-0 z-3 h-200 w-auto max-md:-z-1 max-md:h-260 max-md:opacity-95"
      />
      <Container>
        <Reveal className={cn(HAIRLINE, "mb-22")}>{null}</Reveal>
        <Reveal>
          <Kicker font="home">{content.kicker}</Kicker>
        </Reveal>

        <div className="grid grid-cols-[608px_1fr] gap-36 max-lg:grid-cols-1">
          <div>
            <Reveal variant="clip">
              <SectionTitle id="home-about-title" scale="home" className="mt-22 text-ink">
                <TitleLines lines={content.title} />
              </SectionTitle>
            </Reveal>
            <Reveal>
              <p className="mt-30 font-display text-[9.5px] tracking-[0.32em] text-[#222] max-md:text-[11px]">
                {content.established}
              </p>
            </Reveal>
            <div className={cn(HAIRLINE, "mt-12 mb-14 max-w-610")} />
            {content.paragraphs.map((paragraph, index) => (
              <Reveal key={index} index={index}>
                <Lead
                  variant="home"
                  className={cn("max-w-520 text-[#3a3833]", index === 0 ? "mt-10" : "mt-14")}
                >
                  <RichTextRuns runs={paragraph} strongClassName="font-medium text-ink-2" />
                </Lead>
              </Reveal>
            ))}
            <LogoMarquee
              heading={content.partnersKicker}
              logos={content.partners.map((partner) => ({
                ...partner,
                logo: media[partner.logo].image,
              }))}
            />
            <Reveal>
              <ButtonLink
                href={routes.about}
                variant="outline"
                size="base"
                font="home"
                className="mt-20 h-46 border-[#bbb]"
              >
                {content.cta}
              </ButtonLink>
            </Reveal>
          </div>

          <div>
            <ul className="mt-40 grid grid-cols-4 border-y border-t-ink-2 border-b-[#d9d6cf] max-md:grid-cols-2">
              {content.stats.map((stat, index) => (
                <Reveal
                  key={stat.label}
                  as="li"
                  index={index}
                  className={cn(
                    "border-[#e3e0da] pt-20 pr-16 pb-18 max-md:pt-16 max-md:pr-0 max-md:pb-14",
                    STAT_CELL[index % STAT_CELL.length],
                  )}
                >
                  <StatValue stat={stat} />
                  <span className="mt-10 block font-display text-[9.5px] tracking-[0.12em] whitespace-nowrap text-[#555] uppercase max-md:text-[11px]">
                    {stat.label}
                  </span>
                </Reveal>
              ))}
            </ul>
            <ul>
              {content.values.map((value, index) => (
                <Reveal
                  key={value.title}
                  as="li"
                  variant="left"
                  index={index}
                  className={cn(
                    "grid grid-cols-[44px_255px_1fr] items-center border-[#d9d6cf] pt-14 pb-12 max-md:grid-cols-[34px_1fr] max-md:gap-y-6",
                    index > 0 && "border-t",
                    index === content.values.length - 1 && "border-b",
                  )}
                >
                  <span className="grid place-items-center text-brand">
                    <ValueIcon name={value.icon} />
                  </span>
                  <h3 className="font-display text-[19px] font-normal tracking-[0.04em] uppercase">
                    {value.title}
                  </h3>
                  <p className="font-display text-[11px] leading-[1.65] text-[#333] max-md:col-start-2">
                    {value.text}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
