"use client";

import Image from "next/image";
import { type ComponentPropsWithoutRef, useRef } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { cn } from "@/lib/cn";
import { isInViewport, parallaxCentre, signatureCentre } from "@/lib/motion";

type ParallaxImageProps = ComponentPropsWithoutRef<typeof Image> & {
  /**
   * `inner`: inner pages (`[data-px]`): `translateY(c × −24%) scale(1.3)` (E25).
   * `signature`: home signature image, taller than its frame: `translateY(p × 11%)` (7% on phones)
   * `scale(1.06)` (E26).
   */
  readonly variant?: "inner" | "signature";
  /** Classes for the clipping frame (size it like the original image box). */
  readonly frameClassName?: string;
};

/**
 * An image that drifts as its frame crosses the viewport. Transforms are written straight to the
 * DOM inside the scroll frame, so React never re-renders while scrolling. Static under reduced
 * motion. The image fills the frame (`object-cover`), sized so the drift never shows an edge.
 */
export function ParallaxImage({
  variant = "inner",
  frameClassName,
  className,
  alt,
  ...imageProps
}: ParallaxImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const reduced = useReducedMotion();
  const phone = useMediaQuery("(max-width: 860px)");

  useScrollProgress(
    frameRef,
    (rect, viewportHeight) => {
      const image = imageRef.current;
      if (!image || !isInViewport(rect, viewportHeight)) return;
      image.style.transform =
        variant === "inner"
          ? `translate3d(0, ${(parallaxCentre(rect, viewportHeight) * -24).toFixed(3)}%, 0) scale(1.3)`
          : `translate3d(0, ${(signatureCentre(rect, viewportHeight) * (phone ? 7 : 11)).toFixed(3)}%, 0) scale(1.06)`;
    },
    { enabled: !reduced },
  );

  return (
    <div ref={frameRef} className={cn("relative overflow-hidden", frameClassName)}>
      <Image
        ref={imageRef}
        alt={alt}
        {...imageProps}
        className={cn(
          "absolute left-0 w-full object-cover will-change-transform",
          variant === "inner" ? "inset-y-0 h-full" : "-top-[15%] h-[130%]",
          className,
        )}
      />
    </div>
  );
}
