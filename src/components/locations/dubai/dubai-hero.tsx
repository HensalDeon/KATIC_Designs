import Image from "next/image";

import { AccentTitleText } from "@/components/blocks/title-text";
import { ActionButton, type SectionAction } from "@/components/sections/section-action";
import { resolveImage, type SectionImage } from "@/components/sections/section-image";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import type { AccentTitle } from "@/content/blocks";
import { cn } from "@/lib/cn";

/** Copy of the Dubai banner (plain data: will come from Laravel). */
export type DubaiHeroContent = {
  readonly image: SectionImage;
  readonly kicker: string;
  readonly title: AccentTitle;
  readonly lead: string;
  /** Cream button (`.btn.wh`, `data-go="contact"`). */
  readonly primaryCta: SectionAction;
  /** Outline button on the photo (`.btn.dko`). */
  readonly secondaryCta: SectionAction;
  /** Bottom bar (`.hero > .wrap` with two `.bt`): a label left, a scroll link right. */
  readonly bar: {
    readonly label: string;
    readonly scroll: { readonly label: string; readonly href: string };
  };
};

/**
 * Both hero buttons: `#p-dubai .hero .btn` (56px, Inter 600 13px, 24px sides, 22px above). The
 * original repeats this rule inline on the outline button (a source quirk, not a second design).
 * On phones they stack full width at 50px, label left and arrow right (`.page .hero .btn`).
 */
const HERO_BUTTON =
  "mt-22 h-56 px-24 text-[13px] max-md:mt-0 max-md:flex max-md:h-50 max-md:w-full max-md:justify-between max-md:px-20 max-md:text-[12px]";

/** The bottom bar's two labels (`#p-dubai .hero .bt`): Inter 500 10px, 52px above the edge. */
const BAR_TEXT =
  "absolute bottom-52 flex items-center gap-14 font-sans text-[10px] font-medium tracking-[0.24em] uppercase";

/**
 * Dubai banner (`#p-dubai .hero`, original lines 4157–4167, page `<style>` 4099–4105): full-bleed
 * photo under a left-to-right shade (.62 → .25 → .1), the Inter eyebrow 152px below the top of the
 * centred 720px block, the 76px/.98 title with "Dubai." in orange on its own line, a 16.5/1.75
 * lead, the cream and outline buttons side by side, and a bottom bar: the orange
 * "UAE · RESIDENTIAL · COMMERCIAL" label (the `kick w` rule wins over its inline `#ddd`) and
 * "SCROLL TO EXPLORE", which jumps to `#dubai-context`.
 *
 * One screen tall (at least 720px) on the canvas and at least one screen below 1100px; on phones
 * the content sits at the bottom, the buttons stack and the bottom bar is hidden, as in the
 * original (`.bt` hidden ≤860). The title scales to 62px below 1100px (KI-L16, `HeroTitle`).
 * Marked `data-hero` for the phone quick-contact bar and the parity tool.
 */
export function DubaiHero({ content }: { readonly content: DubaiHeroContent }) {
  const titleId = "dubai-hero-title";
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
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.62),rgba(0,0,0,0.25)_55%,rgba(0,0,0,0.1))] max-md:bg-[linear-gradient(0deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.28)_100%)]"
      />

      <Container className="z-2 pt-152 max-md:pt-110">
        <Kicker className="max-md:gap-10 max-md:tracking-[0.18em]">{content.kicker}</Kicker>
        <HeroTitle id={titleId} className="mt-22 leading-[0.98] max-md:mt-14">
          <AccentTitleText title={content.title} />
        </HeroTitle>
        <p className="mt-26 max-w-660 font-sans text-[16.5px] leading-[1.75] text-mist max-md:mt-16 max-md:max-w-none max-md:text-[15px] max-md:leading-[1.6]">
          {content.lead}
        </p>
        <div className="flex gap-16 max-md:mt-24 max-md:flex-col max-md:gap-10">
          <ActionButton
            action={content.primaryCta}
            className={cn(buttonVariants({ variant: "light", size: "hero" }), HERO_BUTTON)}
          />
          <ActionButton
            action={content.secondaryCta}
            className={cn(buttonVariants({ variant: "outline-light", size: "hero" }), HERO_BUTTON)}
          />
        </div>
      </Container>

      <Container className="absolute inset-x-0 bottom-0 z-2 h-80 max-md:hidden">
        <p
          className={cn(
            BAR_TEXT,
            "left-0 text-kicker before:h-1 before:w-22 before:flex-none before:bg-brand before:content-['']",
          )}
        >
          {content.bar.label}
        </p>
        <a href={content.bar.scroll.href} className={cn(BAR_TEXT, "right-0 text-[#ddd]")}>
          {content.bar.scroll.label}
        </a>
      </Container>
    </section>
  );
}
