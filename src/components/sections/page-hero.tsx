import { cva } from "class-variance-authority";
import Image from "next/image";
import { type ReactNode, useId } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Lead } from "@/components/ui/text";
import { cn } from "@/lib/cn";

import { ActionButton, type SectionAction } from "./section-action";
import { resolveImage, type SectionImage } from "./section-image";

export type PageHeroVariant = "service" | "architecture";

/**
 * Darkening over the photo. Horizontal on the canvas and tablets, vertical on phones (the content
 * sits at the bottom there).
 */
const shadeVariants = cva(
  "absolute inset-0 max-md:bg-[linear-gradient(0deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.28)_100%)]",
  {
    variants: {
      variant: {
        service:
          "bg-[linear-gradient(90deg,rgba(0,0,0,0.74),rgba(0,0,0,0.42)_55%,rgba(0,0,0,0.25))]",
        architecture:
          "bg-[linear-gradient(90deg,rgba(0,0,0,0.62),rgba(0,0,0,0.3)_55%,rgba(0,0,0,0.15))]",
      },
    },
  },
);

/** Phone buttons: full width, 50px, label left and arrow right (`html body .page .hero .hbtns .btn`). */
const PHONE_BUTTON =
  "max-md:flex max-md:h-50 max-md:w-full max-md:justify-between max-md:px-20 max-md:text-[12px]";

export type PageHeroProps = {
  readonly image: SectionImage;
  readonly kicker: string;
  /** Use `<br />` for authored line breaks and `<Accent>` for the orange words. */
  readonly title: ReactNode;
  readonly lead?: ReactNode;
  /** Cream button (`.btn.wh`). Usually `{ kind: "enquiry", service }` (opens Start-a-Project). */
  readonly primaryCta?: SectionAction;
  /** Outline button on imagery (`.btn.dko`). Not rendered by the architecture variant. */
  readonly secondaryCta?: SectionAction;
  /** Small caption at the bottom of the canvas (architecture variant, e.g. "Private residence · Kochi"). */
  readonly caption?: string;
  /** `service` = `.hero.kh-hero` (service, division and location pages); `architecture` = `#p-architecture .hero`. */
  readonly variant?: PageHeroVariant;
  readonly id?: string;
  readonly className?: string;
  readonly "data-testid"?: string;
};

/**
 * Full-bleed page banner of the inner pages: `.hero.kh-hero` (service, division, location, news
 * and blog pages) and its `#p-architecture .hero` variant (76px/.99 title, lighter shade, a single
 * CTA and a bottom caption).
 *
 * On the canvas it is one screen tall (at least 720px) with the content block offset from the top;
 * below 1100px it is at least one screen tall; on phones the content sits at the bottom and the
 * buttons stack full width. Marked `data-hero` for the phone quick-contact bar.
 */
export function PageHero({
  image,
  kicker,
  title,
  lead,
  primaryCta,
  secondaryCta,
  caption,
  variant = "service",
  id,
  className,
  "data-testid": testId,
}: PageHeroProps) {
  const titleId = useId();
  const isArchitecture = variant === "architecture";

  return (
    <section
      id={id}
      data-hero
      data-tone="dark"
      aria-labelledby={titleId}
      data-testid={testId}
      className={cn(
        "relative h-[max(var(--svh),720px)] overflow-hidden bg-ink-2 pt-[max(0px,calc((var(--svh)_-_720px)/2))] text-white",
        "max-lg:h-auto max-lg:min-h-svh max-lg:pt-0",
        "max-md:flex max-md:flex-col max-md:justify-end max-md:pb-40",
        className,
      )}
    >
      <div className="absolute inset-0">
        <Image
          src={resolveImage(image.src)}
          alt={image.alt}
          preload
          fetchPriority="high"
          sizes="100vw"
          className="size-full object-cover"
        />
      </div>
      <div className={shadeVariants({ variant })} />

      <Container className="z-2 pt-190 max-md:pt-110">
        <Kicker className="max-md:gap-10 max-md:tracking-[0.18em]">{kicker}</Kicker>
        <HeroTitle
          id={titleId}
          scale={isArchitecture ? "standard" : "service"}
          className={isArchitecture ? "mt-20 leading-[0.99] max-md:mt-14" : "mt-22 max-md:mt-14"}
        >
          {title}
        </HeroTitle>
        {lead ? (
          <Lead
            variant="hero"
            className={cn(
              "max-md:mt-16 max-md:max-w-none",
              isArchitecture ? "mt-26 max-w-660 text-[#f2f2f2]" : "mt-24",
            )}
          >
            {lead}
          </Lead>
        ) : null}

        {isArchitecture ? (
          primaryCta ? (
            <div className="mt-20 flex max-md:mt-24">
              <ActionButton
                action={primaryCta}
                className={cn(
                  buttonVariants({ variant: "light", size: "hero" }),
                  "px-24",
                  PHONE_BUTTON,
                )}
              />
            </div>
          ) : null
        ) : primaryCta || secondaryCta ? (
          <div className="mt-26 flex flex-wrap gap-16 max-md:mt-24 max-md:flex-col max-md:items-stretch max-md:gap-10">
            {primaryCta ? (
              <ActionButton
                action={primaryCta}
                className={cn(buttonVariants({ variant: "light", size: "hero" }), PHONE_BUTTON)}
              />
            ) : null}
            {secondaryCta ? (
              <ActionButton
                action={secondaryCta}
                className={cn(
                  buttonVariants({ variant: "outline-light", size: "hero" }),
                  PHONE_BUTTON,
                )}
              />
            ) : null}
          </div>
        ) : null}
      </Container>

      {isArchitecture && caption ? (
        <Container className="absolute inset-x-0 bottom-0 z-2 h-60 max-md:hidden">
          <p className="absolute bottom-34 left-0 font-sans text-[10px] tracking-[0.24em] text-[#ccc] uppercase">
            {caption}
          </p>
        </Container>
      ) : null}
    </section>
  );
}
