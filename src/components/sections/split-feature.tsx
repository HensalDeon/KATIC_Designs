import type { ComponentProps, ReactNode } from "react";

import { ZoomableImage } from "@/components/overlays/lightbox";
import { buttonVariants } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Body, Lead } from "@/components/ui/text";
import { cn } from "@/lib/cn";

import { ActionButton, type SectionAction } from "./section-action";
import { resolveImage, type SectionImage } from "./section-image";

export type SplitFeatureCta = SectionAction & {
  /** `.ol` (light, default), `.dk` (dark), `.wh` (cream on dark) or `.orf` (orange). */
  readonly variant?: "outline" | "dark" | "light" | "primary";
};

export type SplitFeatureProps = {
  readonly image: SectionImage;
  /** Dark chip over the bottom-left corner of the image (`.cap`). */
  readonly caption?: string;
  readonly kicker: string;
  /** Use `<br />` for the original's authored line breaks. */
  readonly title: ReactNode;
  readonly titleAs?: ComponentProps<typeof SectionTitle>["as"];
  readonly lead?: ReactNode;
  readonly body?: ReactNode;
  /** Square-bullet list, two columns on the canvas and tablets. */
  readonly bullets?: readonly string[];
  readonly cta?: SplitFeatureCta;
  /** Image on the right on the canvas (`.ksplit.rev`). Below 1100px the image always comes first. */
  readonly reverse?: boolean;
  /** Lightbox group, so several images on a page can be browsed together. */
  readonly lightboxGroup?: string;
  readonly className?: string;
  readonly "data-testid"?: string;
};

/**
 * Image + text block (`.ksplit`, `.ksplit.rev`) rendered inside a `ContentSection`. Two equal
 * columns 64px apart on the canvas, vertically centred; one column (image first) below 1100px; a
 * 320px image and single-column bullets on phones. The image opens in the lightbox. Colours follow
 * the section tone.
 */
export function SplitFeature({
  image,
  caption,
  kicker,
  title,
  titleAs,
  lead,
  body,
  bullets,
  cta,
  reverse = false,
  lightboxGroup,
  className,
  "data-testid": testId,
}: SplitFeatureProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "grid grid-cols-[1fr_1fr] items-center gap-64",
        "max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-28",
        className,
      )}
    >
      <div
        className={cn(
          "relative h-560 overflow-hidden max-md:h-320",
          reverse && "order-2 max-lg:order-none",
        )}
      >
        <ZoomableImage
          image={resolveImage(image.src)}
          alt={image.alt}
          {...(caption ? { caption } : {})}
          {...(lightboxGroup ? { group: lightboxGroup } : {})}
          sizes="(max-width: 860px) calc(100vw - 40px), (max-width: 1099px) calc(100vw - 72px), 42vw"
          buttonClassName="size-full"
          className="size-full object-cover"
        />
        {caption ? (
          <span className="pointer-events-none absolute bottom-20 left-20 bg-[rgba(10,10,10,0.85)] px-12 py-9 font-sans text-[9px] font-semibold tracking-[0.2em] text-white uppercase max-md:text-[11px]">
            {caption}
          </span>
        ) : null}
      </div>

      <div>
        <Kicker>{kicker}</Kicker>
        <SectionTitle as={titleAs} className="mt-22">
          {title}
        </SectionTitle>
        {lead ? (
          <Lead className="mt-28 max-w-none text-[18px] leading-[1.65] text-fg">{lead}</Lead>
        ) : null}
        {body ? <Body className="mt-18">{body}</Body> : null}
        {bullets && bullets.length > 0 ? (
          <ul className="mt-24 grid grid-cols-[1fr_1fr] gap-x-24 gap-y-12 max-md:grid-cols-[1fr]">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-12 border-b border-[#e3dfd7] pb-12 font-sans text-[13.5px] before:size-6 before:flex-none before:bg-brand before:content-[''] in-data-[tone=dark]:border-[#262626]"
              >
                {bullet}
              </li>
            ))}
          </ul>
        ) : null}
        {cta ? (
          <ActionButton
            action={cta}
            className={cn(buttonVariants({ variant: cta.variant ?? "outline" }), "mt-30")}
          />
        ) : null}
      </div>
    </div>
  );
}
