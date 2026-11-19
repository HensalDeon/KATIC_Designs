import { useId } from "react";

import { ZoomableImage } from "@/components/overlays/lightbox";
import { cn } from "@/lib/cn";

import { canvasSizes, type ImageInput, resolveImage } from "./section-media";

export type GalleryItem = {
  readonly image: ImageInput;
  readonly alt: string;
  /** White uppercase label over the image's bottom-left corner. */
  readonly caption: string;
  /** Span two columns (`figure.w`). */
  readonly wide?: boolean;
};

type GalleryProps = {
  readonly items: readonly GalleryItem[];
  /** Lightbox group; defaults to one group per gallery. */
  readonly group?: string;
  readonly className?: string;
};

/**
 * For the two-column tablet layout: which items fill a whole row. Wide figures always do; a
 * regular figure does when it would otherwise sit alone in its row (before a wide one, or last).
 */
function fullRowOnTablet(items: readonly GalleryItem[]): boolean[] {
  let column = 0;
  return items.map((item, index) => {
    if (item.wide === true) {
      column = 0;
      return true;
    }
    const next = items[index + 1];
    const alone = column === 0 && (next === undefined || next.wide === true);
    column = alone ? 0 : (column + 1) % 2;
    return alone;
  });
}

/**
 * Image gallery (`.kgal`): 320px figures in three columns (`wide` figures span two) with white
 * uppercase captions; every image opens the lightbox, browsable within the gallery.
 *
 * Deviations: the original keeps three columns on tablets (KI-L23); here it is two columns below
 * 1100px with no orphan row. On phones figures are as tall as their image (300px); the original
 * keeps 320px figures around 300px images, so captions straddle the image edge.
 */
export function Gallery({ items, group, className }: GalleryProps) {
  const generatedGroup = useId();
  const lightboxGroup = group ?? `gallery-${generatedGroup}`;
  const fullRow = fullRowOnTablet(items);

  return (
    <div className={cn("grid grid-cols-3 gap-18 max-lg:grid-cols-2 max-md:grid-cols-1", className)}>
      {items.map((item, index) => (
        <figure
          key={`${item.caption}-${String(index)}`}
          className={cn(
            "relative h-320 overflow-hidden max-md:col-span-1 max-md:h-300",
            item.wide === true && "col-span-2",
            fullRow[index] === true && "max-lg:col-span-2",
          )}
        >
          <ZoomableImage
            image={resolveImage(item.image)}
            alt={item.alt}
            caption={item.caption}
            group={lightboxGroup}
            sizes={canvasSizes(
              item.wide === true ? 840 : 411,
              fullRow[index] === true ? "100vw" : "50vw",
            )}
            buttonClassName="size-full"
            className="size-full object-cover"
          />
          <figcaption className="pointer-events-none absolute bottom-14 left-16 font-sans text-[9px] font-semibold tracking-[0.2em] text-white uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.6)] max-md:text-[11px]">
            {item.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
