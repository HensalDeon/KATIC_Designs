import Image from "next/image";

import { AccentTitleText } from "@/components/blocks/title-text";
import { resolveImage } from "@/components/sections/section-image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Lead } from "@/components/ui/text";
import { REVIEWS_HERO, type ReviewsHeroContent } from "@/content/reviews";
import { cn } from "@/lib/cn";

/**
 * Reviews hero (`#p-reviews .hero`, markup 4287–4295, page `<style>` 4218–4223): full-bleed photo
 * (the Works hero's) under a left-to-right shade (.7 → .45 → .35), the Inter eyebrow, the 76/1
 * title with an orange "Themselves.", the 17/1.7 lead and the cream "Start Your Project" button to
 * Home's enquiry form (Reviews has none of its own).
 *
 * One screen tall (at least 720px) on the canvas, at least one screen below 1100px; on phones the
 * content sits at the bottom and the button is full width. Marked `data-hero` for the phone
 * quick-contact bar. The title scales to 62px below 1100px (KI-L16, `HeroTitle`).
 */
export function ReviewsHero({ content = REVIEWS_HERO }: { readonly content?: ReviewsHeroContent }) {
  const titleId = "reviews-hero-title";
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
          sizes="100vw"
          className="size-full object-cover"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.7),rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.35))] max-md:bg-[linear-gradient(0deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.28)_100%)]"
      />

      <Container className="z-2 pt-172 max-md:pt-110">
        <Kicker className="max-md:gap-10 max-md:tracking-[0.18em]">{content.kicker}</Kicker>
        <HeroTitle id={titleId} className="mt-22 leading-none max-md:mt-14">
          <AccentTitleText title={content.title} />
        </HeroTitle>
        <Lead variant="hero" className="mt-20 max-md:mt-16 max-md:max-w-none">
          {content.lead}
        </Lead>
        <ButtonLink
          href={content.cta.href}
          variant="light"
          size="section"
          icon="up-right"
          className="mt-20 max-md:mt-24 max-md:flex max-md:h-50 max-md:w-full max-md:justify-between max-md:px-20 max-md:text-[12px]"
        >
          {content.cta.label}
        </ButtonLink>
      </Container>
    </section>
  );
}
