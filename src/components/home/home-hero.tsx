import "./home-hero.css";

import { getImageProps } from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { StartProjectTrigger } from "@/components/shell/start-project-trigger";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroTitle } from "@/components/ui/heading";
import { Lead } from "@/components/ui/text";
import { HOME_HERO, type HomeHeroContent } from "@/content/home/hero";
import { media } from "@/content/media";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import { HERO_MOBILE_QUERY } from "./hero-media";
import { HeroVideo } from "./hero-video";
import { TitleLines } from "./title-lines";

type HomeHeroProps = {
  readonly content?: HomeHeroContent;
};

/** Phone buttons: full width, 50px, label left and arrow right (`html body .page .hero .btns`). */
const PHONE_BUTTON = "max-md:flex max-md:h-50 max-md:w-full max-md:justify-between max-md:px-20";

/**
 * The video poster as an art-directed `<picture>`: the portrait still for `HERO_MOBILE_QUERY`,
 * the landscape one otherwise. It is the hero's largest paint, so it loads with high priority.
 */
function HeroPoster({ video }: { readonly video: HomeHeroContent["video"] }) {
  const common = { alt: "", sizes: "100vw" } as const;
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: media[video.mobilePoster].image });
  const { props: desktop } = getImageProps({
    ...common,
    src: media[video.desktopPoster].image,
    fetchPriority: "high",
    loading: "eager",
  });
  return (
    <picture>
      <source media={HERO_MOBILE_QUERY} srcSet={mobileSrcSet} sizes={common.sizes} />
      <img {...desktop} alt="" className="absolute inset-0 size-full object-cover" />
    </picture>
  );
}

/**
 * Home hero (`#p-home .hero`): full-screen background video (`HeroVideo`) under a two-way shade,
 * with the eyebrow, the 78/.93 title with its orange last line, the lead and two actions anchored
 * to the bottom-left. Children rise in with the staggered `kHeroIn` intro (E18).
 *
 * "Start a Project" opens the Start-a-Project popup; "View Our Projects" opens the works page.
 * One screen tall (at least 720px) on the canvas, at least one screen below 1100px; on phones the
 * buttons stack full width. Marked `data-hero` for the phone quick-contact bar.
 */
export function HomeHero({ content = HOME_HERO }: HomeHeroProps) {
  const titleId = "home-hero-title";
  return (
    <section
      data-hero
      data-tone="dark"
      aria-labelledby={titleId}
      className="relative flex h-[max(var(--svh),720px)] flex-col justify-end overflow-hidden bg-ink-2 pb-64 text-white max-lg:h-auto max-lg:min-h-svh max-md:pb-40"
    >
      <HeroPoster video={content.video} />
      <HeroVideo desktopSrc={content.video.desktopSrc} mobileSrc={content.video.mobileSrc} />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.45)_38%,rgba(0,0,0,0.12)_70%,rgba(0,0,0,0.25)_100%),linear-gradient(90deg,rgba(0,0,0,0.35),rgba(0,0,0,0)_60%)]"
      />

      <Container className="home-hero-intro z-2">
        <p className="flex items-center gap-12 font-display text-[13px] tracking-[0.02em] text-[#e9e5dd] before:size-5 before:flex-none before:rounded-full before:bg-brand before:content-[''] max-md:gap-10 max-md:text-[11px] max-md:tracking-[0.18em]">
          {content.eyebrow}
        </p>
        <HeroTitle id={titleId} scale="home" className="mt-22 max-md:mt-14">
          <TitleLines lines={content.title} />
        </HeroTitle>
        <Lead
          variant="home"
          className="mt-30 max-w-610 text-[17px] leading-[1.6] text-mist max-md:mt-16 max-md:max-w-none max-md:text-[15px]"
        >
          {content.lead}
        </Lead>
        <div className="mt-28 flex items-center gap-28 max-md:mt-24 max-md:flex-col max-md:items-stretch max-md:gap-10">
          <StartProjectTrigger
            className={cn(
              buttonVariants({ variant: "light", size: "base", font: "home" }),
              PHONE_BUTTON,
            )}
          >
            {content.primaryCta}
            <ArrowIcon className="flex-none" />
          </StartProjectTrigger>
          <Link
            href={routes.works}
            className={cn(
              "font-display text-[12px] font-medium tracking-[0.16em] text-white uppercase",
              "max-md:items-center max-md:border max-md:border-[rgba(255,255,255,0.45)]",
              PHONE_BUTTON,
            )}
          >
            {content.secondaryCta}
          </Link>
        </div>
      </Container>
    </section>
  );
}
