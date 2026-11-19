import Image from "next/image";
import Link from "next/link";

import { TitleLines } from "@/components/home/title-lines";
import { ServiceIcon } from "@/components/icons/service-icon";
import { resolveImage } from "@/components/sections/section-image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { getProject, projectHref } from "@/content/projects";
import { WORKS_HERO, type WorksHeroContent } from "@/content/works";
import { cn } from "@/lib/cn";

type WorksHeroProps = {
  readonly content?: WorksHeroContent;
};

/**
 * Works hero (`#p-works .hero`, markup 3694–3704, page `<style>` 3606–3615): full-bleed photo under
 * a left-to-right shade (.72 → .42 → .3), the Inter eyebrow, the 78px title with an orange second
 * line, a 16/1.65 lead and the cream "Explore Projects" button to the portfolio. The "current
 * project" note (`a.cur`) sits at the right of the canvas and is hidden below 1100px, as in the
 * original.
 *
 * One screen tall (at least 720px) on the canvas, at least one screen below 1100px; on phones the
 * content sits at the bottom and the button is full width. Marked `data-hero` for the phone
 * quick-contact bar. The title scales to 62px below 1100px (KI-L16, `HeroTitle`).
 */
export function WorksHero({ content = WORKS_HERO }: WorksHeroProps) {
  const titleId = "works-hero-title";
  const current = getProject(content.current.project);
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
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.42)_55%,rgba(0,0,0,0.3))] max-md:bg-[linear-gradient(0deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.28)_100%)]"
      />

      <Container size="wide" className="z-2 pt-192 max-md:pt-110">
        <Kicker className="max-md:gap-10 max-md:tracking-[0.18em]">{content.kicker}</Kicker>
        <HeroTitle id={titleId} className="mt-22 text-[78px] max-md:mt-14">
          <TitleLines lines={content.title} />
        </HeroTitle>
        <p className="mt-26 max-w-600 font-sans text-[16px] leading-[1.65] text-[#f2f2f2] max-md:mt-16 max-md:max-w-none max-md:text-[15px] max-md:leading-[1.6]">
          {content.lead}
        </p>
        <ButtonLink
          href={content.cta.href}
          variant="light"
          size="sm"
          icon="up-right"
          className="mt-22 font-semibold max-md:mt-24 max-md:flex max-md:h-50 max-md:w-full max-md:justify-between max-md:px-20 max-md:text-[12px]"
        >
          {content.cta.label}
        </ButtonLink>

        <Link
          href={projectHref(current)}
          className="absolute top-252 right-0 w-255 border-t border-[rgba(255,255,255,0.35)] pt-14 font-sans max-lg:hidden"
        >
          {/* `small.nico` is inline in the original, so its 6px margin and the name's 8px add up. */}
          <ServiceIcon name="leaf" size={20} className="mb-14 block text-brand" />
          <b className="block text-[17.5px] font-normal">{content.current.label}</b>
          <span className="mt-6 block text-[10.5px] text-[#bbb]">{content.current.meta}</span>
        </Link>
      </Container>
    </section>
  );
}
