import { cva } from "class-variance-authority";
import Image from "next/image";
import type { ReactElement, ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";

import { type ImageInput, resolveImage } from "./section-media";

export type CtaBandVariant = "works" | "project" | "reviews";

export type CtaBandCall = {
  readonly label: string;
  readonly phone: { readonly display: string; readonly href: `tel:${string}` };
  readonly hours: string;
};

type CtaBandProps = {
  /** Page preset: works (`#p-works .ctasec`), project (`#p-project`) or reviews (`#p-reviews`). */
  readonly variant: CtaBandVariant;
  readonly image: ImageInput;
  readonly alt: string;
  readonly kicker: string;
  /** Use `<br />` for the original's authored line breaks. */
  readonly title: ReactNode;
  readonly text: string;
  readonly cta: { readonly label: string; readonly href: string };
  /** "Prefer to call?" box at the bottom right (works). */
  readonly call?: CtaBandCall;
  readonly id?: string;
  readonly className?: string;
  /** Classes for the background `<img>` (e.g. parallax transforms). */
  readonly imageClassName?: string;
  /**
   * Wraps the background image, e.g. in a parallax client component. The image fills its parent,
   * which sits absolutely behind the overlay.
   */
  readonly renderImage?: (image: ReactElement) => ReactNode;
  readonly "data-testid"?: string;
  /** Parity-tool match for the original's id-less `.ctasec` (`ctasec`, DECISIONS P5-01). */
  readonly "data-parity"?: string;
};

/** The left-to-right shade over the image (`.ctasec::before`). */
const shadeVariants = cva("", {
  variants: {
    variant: {
      works: "before:bg-[linear-gradient(90deg,rgba(0,0,0,0.72),rgba(0,0,0,0.45))]",
      project: "before:bg-[linear-gradient(90deg,rgba(0,0,0,0.6),rgba(0,0,0,0.25))]",
      reviews:
        "before:bg-[linear-gradient(90deg,rgba(0,0,0,0.82),rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.4))]",
    },
  },
});

/** `.ctasec .wrap`: works fills the band so its call box can sit at the bottom. */
const wrapVariants = cva("z-2 max-md:pt-80", {
  variants: {
    variant: {
      works: "pt-100 lg:h-full",
      project: "pt-104",
      reviews: "pt-96",
    },
  },
});

const titleVariants = cva("text-white max-md:mt-30 max-md:text-[34px]", {
  variants: {
    variant: {
      works: "mt-140 font-display text-[58px] leading-[1.14] font-normal uppercase",
      project: "mt-110 font-sans text-[66px] leading-[1.05] font-normal tracking-[-0.01em]",
      reviews: "mt-42 font-sans text-[62px] leading-[1.12] font-normal tracking-[-0.01em]",
    },
  },
});

const textVariants = cva("font-sans text-white", {
  variants: {
    variant: {
      works: "mt-20 max-w-580 text-[15.5px] leading-[1.75]",
      project: "mt-28 max-w-520 text-[15.5px] leading-[1.75]",
      reviews: "mt-18 text-[17px]",
    },
  },
});

const BUTTON = {
  works: { size: "sm", className: "mt-22 font-semibold" },
  project: {
    size: "hero",
    className: "mt-12 gap-24 px-24 text-[11.5px] tracking-[0.12em] uppercase",
  },
  reviews: { size: "section", className: "mt-80" },
} as const;

/**
 * Full-bleed call-to-action band (`.ctasec`) on works, project and reviews: a background image
 * under a dark left-to-right gradient, then kicker, title, text and an orange button. One screen
 * tall on the canvas (`max(var(--svh), 680px)`, content offset so it sits centred in a 680px band);
 * content height plus 80px below 1100px.
 *
 * Deviation: the original has no bottom padding at 861–1099px, so the button touches the band's
 * lower edge; here the 80px phone padding applies to every width below 1100px.
 */
export function CtaBand({
  variant,
  image,
  alt,
  kicker,
  title,
  text,
  cta,
  call,
  id,
  className,
  imageClassName,
  renderImage,
  "data-testid": testId,
  "data-parity": parity,
}: CtaBandProps) {
  const background = (
    <Image
      src={resolveImage(image)}
      alt={alt}
      fill
      sizes="100vw"
      className={cn("object-cover", variant === "reviews" && "object-[center_40%]", imageClassName)}
    />
  );
  const button = BUTTON[variant];

  return (
    <Section
      tone="dark"
      spacing="none"
      fullHeight={false}
      {...(id ? { id } : {})}
      data-testid={testId}
      data-parity={parity}
      className={cn(
        "text-white before:absolute before:inset-0 before:z-1 before:content-[''] max-lg:pb-80 lg:h-[max(var(--svh),680px)] lg:pt-[max(0px,calc((var(--svh)_-_680px)/2))]",
        shadeVariants({ variant }),
        className,
      )}
    >
      <div className="absolute inset-0">{renderImage ? renderImage(background) : background}</div>
      <Container size={variant === "works" ? "wide" : "site"} className={wrapVariants({ variant })}>
        <Kicker>{kicker}</Kicker>
        <h2 className={titleVariants({ variant })}>{title}</h2>
        <p className={textVariants({ variant })}>{text}</p>
        <ButtonLink
          href={cta.href}
          variant="primary"
          size={button.size}
          icon="up-right"
          className={button.className}
        >
          {cta.label}
        </ButtonLink>
        {call ? (
          <div className="absolute right-0 bottom-80 w-270 border-t border-[rgba(255,255,255,0.3)] pt-22 max-md:static max-md:mt-40">
            <small className="font-sans text-[9px] font-semibold tracking-[0.2em] text-brand max-md:text-[11px]">
              {call.label}
            </small>
            <a href={call.phone.href} className="mt-8 block font-sans text-[21px] font-medium">
              {call.phone.display}
            </a>
            <span className="mt-10 block font-sans text-[10.5px] text-[#ccc] max-md:text-[11px]">
              {call.hours}
            </span>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
