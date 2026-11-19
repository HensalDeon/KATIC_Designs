import { cva } from "class-variance-authority";
import { useId } from "react";

import { ZoomableImage } from "@/components/overlays/lightbox";
import { cn } from "@/lib/cn";

import { canvasSizes, type ImageInput, resolveImage } from "./section-media";

export type BeforeAfterImage = { readonly image: ImageInput; readonly alt: string };

export type BeforeAfterPair = {
  readonly before: BeforeAfterImage;
  readonly after: BeforeAfterImage;
  readonly title: string;
  /** Small orange line under the title, e.g. "Commercial · Aluva". */
  readonly meta: string;
  readonly text: string;
};

type BeforeAfterProps = {
  readonly pairs: readonly BeforeAfterPair[];
  /** Chip labels. */
  readonly labels?: { readonly before: string; readonly after: string };
  /** Lightbox group; defaults to one group for all pairs. */
  readonly group?: string;
  readonly className?: string;
};

const chipVariants = cva(
  "pointer-events-none absolute top-16 left-16 px-10 py-7 font-sans text-[9px] font-semibold tracking-[0.2em] text-white max-md:text-[11px]",
  {
    variants: {
      stage: {
        before: "bg-ink-2",
        after: "bg-brand",
      },
    },
  },
);

const DEFAULT_LABELS = { before: "BEFORE", after: "AFTER" } as const;

/**
 * Before/after pairs (`.kba`): the two photographs side by side with BEFORE (`#111`) and AFTER
 * (orange) chips, then a 360px text column, bottom-aligned. Figures are 250px tall on the canvas and
 * 380px stacked below 1100px. Static by design (KI-F17 keeps parity); images open the lightbox.
 *
 * Deviation: on phones figures are as tall as their image (300px). The original keeps 380px figures
 * around 300px images, leaving an empty band under each photo.
 */
export function BeforeAfter({
  pairs,
  labels = DEFAULT_LABELS,
  group,
  className,
}: BeforeAfterProps) {
  const generatedGroup = useId();
  const lightboxGroup = group ?? `before-after-${generatedGroup}`;

  return (
    <div className={cn("grid gap-28 max-lg:gap-56", className)}>
      {pairs.map((pair) => (
        <div
          key={pair.title}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_360px] [align-items:end] gap-18 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-28"
        >
          {(["before", "after"] as const).map((stage) => (
            <figure
              key={stage}
              className="relative h-250 overflow-hidden max-lg:h-380 max-md:h-300"
            >
              <ZoomableImage
                image={resolveImage(pair[stage].image)}
                alt={pair[stage].alt}
                caption={`${labels[stage]} · ${pair.title}`}
                group={lightboxGroup}
                sizes={canvasSizes(436, "100vw")}
                buttonClassName="size-full"
                className="size-full object-cover"
              />
              <span className={chipVariants({ stage })}>{labels[stage]}</span>
            </figure>
          ))}
          <div>
            <h3 className="font-sans text-[24px] font-normal">{pair.title}</h3>
            <small className="mt-10 block font-sans text-[9px] font-semibold tracking-[0.16em] text-[#c0522a] uppercase in-data-[tone=dark]:text-brand max-md:text-[11px]">
              {pair.meta}
            </small>
            <p className="mt-12 font-sans text-[13px] leading-[1.75] text-fg-body">{pair.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
