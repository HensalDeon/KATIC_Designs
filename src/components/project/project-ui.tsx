import type { CSSProperties, ReactNode } from "react";

import { LineBreaks } from "@/components/blocks/title-text";
import { ZoomableImage } from "@/components/overlays/lightbox";
import { resolveImage, type SectionImage } from "@/components/sections/section-image";
import { ButtonLink, buttonVariants } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { cn } from "@/lib/cn";
import type { ProjectLink, ProjectSectionHeading } from "@/lib/schemas/project-details";

/**
 * Shared pieces of the project detail sections (`#p-project`, original lines 3782–3977): the
 * `.two` header grid, the `.st` title at the page's 1.14 line height, the `.btn.cap` button and the
 * closing `.stm` statement.
 */

/** `#p-project .two`: 646px heading column and the copy beside it; stacked with a 36px gap below 1100px. */
export function ProjectTwo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-[646px_1fr] max-lg:grid-cols-1 max-lg:gap-36", className)}>
      {children}
    </div>
  );
}

type ProjectHeadingProps = {
  readonly heading: ProjectSectionHeading;
  readonly id: string;
  /** Title offset under the kicker (the original's inline `margin-top`). */
  readonly titleClassName: string;
};

/** Kicker and `.st` title (`#p-project .st{font-size:58px;line-height:1.14}`; 46px/34px below, KI-N04). */
export function ProjectHeading({ heading, id, titleClassName }: ProjectHeadingProps) {
  return (
    <div>
      <Kicker>{heading.kicker}</Kicker>
      <SectionTitle id={id} className={cn("leading-[1.14] max-md:leading-[1.14]", titleClassName)}>
        <LineBreaks lines={heading.title} />
      </SectionTitle>
    </div>
  );
}

/** `.btn.cap`: 54px, Inter 600 11.5px uppercase, 0.12em tracking, 24px gap, ↗ arrow. */
export const CAP_BUTTON =
  "h-54 gap-24 px-24 text-[11.5px] font-semibold tracking-[0.12em] uppercase";

type CapButtonProps = {
  readonly link: ProjectLink;
  readonly variant: "primary" | "dark";
  readonly className?: string;
};

export function CapButton({ link, variant, className }: CapButtonProps) {
  return (
    <ButtonLink
      href={link.href}
      variant={variant}
      size="hero"
      icon="up-right"
      className={cn(CAP_BUTTON, className)}
    >
      {link.label}
    </ButtonLink>
  );
}

/** Classes of a `.btn.cap` (for a trigger that is not a `ButtonLink`). */
export function capButtonClasses(
  variant: "primary" | "dark" | "outline-light",
  className?: string,
) {
  return cn(buttonVariants({ variant, size: "hero" }), CAP_BUTTON, className);
}

type ProjectStatementProps = {
  readonly text: string;
  readonly link: ProjectLink;
  readonly variant: "primary" | "dark";
  /** Size and colour of the statement (`.stm p`). */
  readonly textClassName: string;
  readonly buttonClassName?: string;
  readonly className?: string;
};

/** `.stm`: a large statement and its button on one row; stacked with a 24px gap on phones. */
export function ProjectStatement({
  text,
  link,
  variant,
  textClassName,
  buttonClassName,
  className,
}: ProjectStatementProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-24",
        className,
      )}
    >
      <p className={cn("max-w-520 font-sans", textClassName)}>{text}</p>
      <CapButton
        link={link}
        variant={variant}
        {...(buttonClassName ? { className: buttonClassName } : {})}
      />
    </div>
  );
}

type ProjectImageProps = {
  readonly image: SectionImage;
  /**
   * Height and phone overrides of the photo, e.g. `h-502 max-md:h-340`. With `height`, use
   * `h-(--h)` for the canvas height.
   */
  readonly className: string;
  /** Canvas height from content (the original's inline `height`), exposed as `--h`. */
  readonly height?: number;
  readonly sizes: string;
  readonly caption?: string;
  readonly group?: string;
  readonly buttonClassName?: string;
};

/**
 * A full-width photo that opens the lightbox: the original tags every image of the page's sections
 * except the call to action with `data-zoom` (lines 5296–5299).
 */
export function ProjectImage({
  image,
  className,
  sizes,
  caption,
  group,
  buttonClassName,
  height,
}: ProjectImageProps) {
  return (
    <ZoomableImage
      image={resolveImage(image.src)}
      alt={image.alt}
      sizes={sizes}
      {...(caption ? { caption } : {})}
      {...(group ? { group } : {})}
      buttonClassName={cn("w-full", buttonClassName)}
      className={cn("w-full object-cover", className)}
      {...(height === undefined
        ? {}
        : { style: { "--h": `${String(height)}px` } as CSSProperties })}
    />
  );
}
