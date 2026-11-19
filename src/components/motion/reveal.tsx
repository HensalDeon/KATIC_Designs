"use client";

import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import { useRef } from "react";

import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";
import { revealDelay } from "@/lib/motion";

export type RevealVariant = "fade-up" | "clip" | "left" | "scale";

type RevealProps = Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "style"> & {
  readonly variant?: RevealVariant | undefined;
  /** Position in a group; delays the reveal by `min(index, 6) × 0.09s`. */
  readonly index?: number | undefined;
  readonly as?: ElementType;
  readonly className?: string | undefined;
  readonly children: ReactNode;
};

/**
 * Reveal-on-scroll (the home page's `data-rv`, E16). Hidden start states live in globals.css under
 * `.js [data-reveal]`, so content stays visible without JavaScript; reduced motion shows it at once.
 * IntersectionObserver settings match the original: threshold .12, bottom margin −8%, once.
 */
export function Reveal({
  variant = "fade-up",
  index = 0,
  as: Tag = "div",
  className,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  const reduced = useReducedMotion();

  return (
    <Tag
      {...rest}
      ref={ref}
      data-reveal={variant}
      data-shown={inView || reduced ? "" : undefined}
      style={{ "--reveal-delay": `${revealDelay(index)}s` } as CSSProperties}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
