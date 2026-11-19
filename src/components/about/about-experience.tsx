import { TitleLines } from "@/components/home/title-lines";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { ABOUT_EXPERIENCE, type AboutExperienceContent } from "@/content/about";
import { cn } from "@/lib/cn";

import { ABOUT_TITLE_CLASS, AboutColumns } from "./about-columns";

/**
 * Dark outline button of the About page's black sections (`.btn.ol.sm` as rendered there): black,
 * slate border, no hover change (the original freezes these colours).
 */
export const ABOUT_DARK_OUTLINE_BUTTON =
  "border-[#30343c] bg-black text-mist hover:border-[#30343c]";

type AboutExperienceProps = {
  readonly content?: AboutExperienceContent;
};

/**
 * Experience stats (`#p-about section.ex`, black): kicker and title beside a lead and "View
 * Projects", then four figures (Inter 300 50px) between a white top rule and a dark bottom rule,
 * separated by hairlines. Two by two below 1100px, one column on phones (rules between rows).
 * Figures are static: the count-up runs on Home only. Facts to confirm: KI-C10.
 */
export function AboutExperience({ content = ABOUT_EXPERIENCE }: AboutExperienceProps) {
  const titleId = "about-experience-title";
  return (
    <Section tone="dark" data-parity="ex" aria-labelledby={titleId}>
      <Container className="text-[#f4f4f4]">
        <AboutColumns
          start={
            <>
              <Kicker className="text-[#a3a3a3]">{content.kicker}</Kicker>
              <SectionTitle id={titleId} className={cn("mt-22 text-[#f4f4f4]", ABOUT_TITLE_CLASS)}>
                <TitleLines lines={content.title} />
              </SectionTitle>
            </>
          }
          end={
            <>
              <p className="mt-4 max-w-560 font-sans text-[19.5px] leading-[1.6] font-medium max-md:text-[15px]">
                {content.lead}
              </p>
              <ButtonLink
                href={content.cta.href}
                variant="outline"
                size="sm"
                icon="up-right"
                className={cn("mt-22", ABOUT_DARK_OUTLINE_BUTTON)}
              >
                {content.cta.label}
              </ButtonLink>
            </>
          }
        />

        <dl className="mt-62 grid grid-cols-4 border-t border-b border-t-white border-b-[#333] max-lg:grid-cols-2 max-md:grid-cols-1">
          {content.stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col border-[#2a2a2a] px-24 pt-28 pb-26 not-first:border-l first:pl-0 max-lg:nth-[2n+1]:border-l-0 max-lg:nth-[2n+1]:pl-0 max-lg:nth-[n+3]:border-t max-md:px-0 max-md:py-22 max-md:not-first:border-t max-md:not-first:border-l-0"
            >
              {/* The label is the term; the figure shows first, as in the original. */}
              <dt className="order-2 mt-16 font-sans text-[12.5px] font-semibold tracking-[0.12em] uppercase">
                {stat.label}
              </dt>
              <dd className="order-1 font-sans text-[50px] font-light">{stat.value}</dd>
              <dd className="order-3 mt-12 font-sans text-[11px] text-[#999]">{stat.caption}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
