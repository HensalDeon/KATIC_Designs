import Image from "next/image";

import { AccentTitleText } from "@/components/blocks/title-text";
import { ArrowIcon } from "@/components/icons/arrow-icon";
import { resolveImage } from "@/components/sections/section-image";
import { Container } from "@/components/ui/container";
import { HeroTitle } from "@/components/ui/heading";
import type { ProjectHeroContent } from "@/content/project-details";

import { capButtonClasses } from "./project-ui";

type ProjectHeroProps = {
  readonly content: ProjectHeroContent;
  /** Id of the gallery section "View Gallery" scrolls to. */
  readonly galleryId: string;
};

/**
 * Project banner (`#p-project .hero`, original lines 3862–3870): full-bleed photo under two shades
 * (left-to-right and bottom-up), the 78px/1 name with its orange last word, the location, an
 * outline "View Gallery" button at the right (top 370px of the centred 720px block) and the sector
 * line centred 72px above the bottom edge behind a 26px orange rule.
 *
 * One screen tall (at least 720px) on the canvas, at least one screen below 1100px. On phones the
 * content sits at the bottom, the button goes full width and the sector line is hidden, as on every
 * page of the original. The title scales to 62px below 1100px (KI-L16). Marked `data-hero` for the
 * phone quick-contact bar.
 */
export function ProjectHero({ content, galleryId }: ProjectHeroProps) {
  const titleId = "project-hero-title";
  return (
    <section
      data-hero
      data-tone="dark"
      aria-labelledby={titleId}
      className="relative h-[max(var(--svh),720px)] overflow-hidden bg-ink-2 pt-[max(0px,calc((var(--svh)_-_720px)/2))] text-white max-lg:h-auto max-lg:min-h-svh max-lg:pt-0 max-md:flex max-md:flex-col max-md:justify-end max-md:pb-40"
    >
      <div className="absolute inset-0">
        <Image
          src={resolveImage(content.image.src)}
          alt={content.image.alt}
          preload
          fetchPriority="high"
          sizes="100vw"
          className="size-full object-cover"
          style={content.objectPosition ? { objectPosition: content.objectPosition } : undefined}
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.55),rgba(0,0,0,0.15)_60%,rgba(0,0,0,0.1)),linear-gradient(0deg,rgba(0,0,0,0.35),transparent_40%)] max-md:bg-[linear-gradient(0deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.28)_100%)]"
      />

      <Container className="z-2 pt-298 max-md:pt-110">
        <HeroTitle id={titleId} className="text-[78px] leading-none max-md:mt-14">
          <AccentTitleText title={{ ...content.title, accentOnNewLine: true }} />
        </HeroTitle>
        <p className="mt-22 font-sans text-[15.5px] font-medium tracking-[0.02em]">
          {content.location}
        </p>
        <a
          href={`#${galleryId}`}
          className={capButtonClasses(
            "outline-light",
            "absolute top-370 right-0 h-52 gap-26 px-26 max-md:static max-md:mt-24 max-md:flex max-md:h-50 max-md:w-full max-md:justify-between max-md:px-20 max-md:text-[12px]",
          )}
        >
          {content.galleryLabel}
          <ArrowIcon direction="up-right" className="flex-none" />
        </a>
      </Container>

      <p className="absolute bottom-72 left-1/2 z-2 flex -translate-x-1/2 items-center gap-12 font-sans text-[10.5px] font-semibold tracking-[0.24em] whitespace-nowrap before:h-1 before:w-26 before:bg-brand before:content-[''] max-md:hidden">
        {content.sectorLine}
      </p>
    </section>
  );
}
