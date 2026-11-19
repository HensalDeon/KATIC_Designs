import Image from "next/image";
import type { CSSProperties } from "react";

import { media, type MediaId } from "@/content/media";
import { cn } from "@/lib/cn";

const CORNERS = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
} as const;

type PlantProps = {
  asset: Extract<MediaId, `plants/${string}`>;
  corner: keyof typeof CORNERS;
  /** Width on the 1440 canvas in px; phones render it at 58%. */
  width: number;
  /** Sit behind the section's content (`.pp-host > .plant.pp`). The section needs `isolate`. */
  behind?: boolean;
  className?: string;
};

/**
 * Decorative plant cut-out anchored to a section corner (`.plant`). Static by design: the original's
 * sway animations are disabled by a later rule (KI-L39).
 */
export function Plant({ asset, corner, width, behind = false, className }: PlantProps) {
  return (
    <Image
      src={media[asset].image}
      alt=""
      aria-hidden
      sizes={`${width}px`}
      style={{ "--w": `${width}px` } as CSSProperties}
      className={cn(
        "pointer-events-none absolute h-auto w-(--w) max-md:w-[calc(var(--w)*0.58)]",
        behind ? "-z-1" : "z-3",
        CORNERS[corner],
        className,
      )}
    />
  );
}
