import Image from "next/image";
import Link from "next/link";
import { Fragment, useId } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Accent, HeroTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Lead } from "@/components/ui/text";
import { resolveMedia } from "@/lib/media/resolve";
import type { RelatedService } from "@/lib/schemas/entities";
import type { ServicesHeroContent } from "@/lib/schemas/services-page";

type ServicesHeroProps = {
  readonly content: ServicesHeroContent;
  /** The side index: the page's services, in page order, as their service cards name them. */
  readonly services: readonly Pick<RelatedService, "slug" | "title" | "href">[];
};

/**
 * Services banner (`#p-services .hero`): full-bleed photo under a horizontal shade, the eyebrow,
 * the 76/.98 four-line title with its orange last line, the lead and "Explore Our Work". On the
 * canvas a side index of the seven services (`.wd`) sits top-right; it is hidden below 1100px.
 *
 * One screen tall (at least 720px, content offset 118px into the centred 720px block) on the
 * canvas; at least one screen below 1100px; on phones the content sits at the bottom and the button
 * goes full width. The title scales to 62px below 1100px (the original keeps 76px, KI-L16).
 * Marked `data-hero` for the phone quick-contact bar.
 */
export function ServicesHero({ content, services }: ServicesHeroProps) {
  const titleId = useId();
  const indexId = useId();

  return (
    <section
      data-hero
      data-tone="dark"
      aria-labelledby={titleId}
      className="relative h-[max(var(--svh),720px)] overflow-hidden bg-ink-2 pt-[max(0px,calc((var(--svh)_-_720px)/2))] text-white max-lg:h-auto max-lg:min-h-svh max-lg:pt-0 max-md:flex max-md:flex-col max-md:justify-end max-md:pb-40"
    >
      <div className="absolute inset-0">
        <Image
          src={resolveMedia(content.image.src)}
          alt={content.image.alt}
          preload
          fetchPriority="high"
          sizes="100vw"
          className="size-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.75),rgba(0,0,0,0.45)_55%,rgba(0,0,0,0.35))] max-md:bg-[linear-gradient(0deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.28)_100%)]" />

      <Container className="z-2 pt-118 max-md:pt-110">
        <Kicker className="max-md:gap-10 max-md:tracking-[0.18em]">{content.kicker}</Kicker>
        <HeroTitle id={titleId} className="mt-18 leading-[0.98] max-md:mt-14">
          {content.titleLines.map((line) => (
            <Fragment key={line}>
              {line}
              <br />
            </Fragment>
          ))}
          <Accent>{content.accent}</Accent>
        </HeroTitle>
        <Lead
          variant="hero"
          className="mt-26 max-w-620 text-[15.5px] leading-[1.75] max-md:mt-16 max-md:max-w-none"
        >
          {content.lead}
        </Lead>
        <ButtonLink
          href={content.cta.href}
          variant="light"
          size="hero"
          icon="up-right"
          className="mt-22 px-24 max-md:mt-24 max-md:flex max-md:h-50 max-md:w-full max-md:justify-between max-md:px-20 max-md:text-[12px]"
        >
          {content.cta.label}
        </ButtonLink>

        <nav
          aria-labelledby={indexId}
          className="absolute top-160 right-0 w-270 border-t border-[rgba(255,255,255,0.3)] pt-16 max-lg:hidden"
        >
          {/* The label sits in a Jost 16px line box, like the original's inline `<small>`. */}
          <p className="font-display text-[16px]">
            <span
              id={indexId}
              className="font-sans text-[9px] font-medium tracking-[0.24em] text-[#ccc]"
            >
              {content.indexLabel}
            </span>
          </p>
          <ul>
            {services.map((service) => (
              <li key={service.slug} className="mt-9 first:mt-16">
                <Link
                  href={service.href}
                  className="block font-sans text-[15px] text-white transition-colors duration-200 hover:text-brand"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
