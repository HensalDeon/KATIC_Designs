import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

/**
 * Eyebrow label above section titles (`.kick`): uppercase, letter-spaced, with a 22px orange rule
 * (or a 5px dot) in front. Colour follows the section tone: text-safe orange #C24E1E on white,
 * brand orange on black (KI-A11).
 */
const kickerVariants = cva(
  "flex items-center gap-12 text-kicker uppercase before:flex-none before:bg-brand before:content-[''] max-md:text-[11px]",
  {
    variants: {
      /** `sans` = `.kick.int` (Inter, inner pages), `home` = home page scale. */
      font: {
        sans: "font-sans text-[9.5px] font-medium tracking-[0.2em]",
        home: "font-display text-[11px] font-medium tracking-[0.22em]",
      },
      marker: {
        line: "before:h-1 before:w-22",
        dot: "before:size-5 before:rounded-full",
      },
      align: {
        start: "",
        center: "justify-center",
      },
    },
    defaultVariants: { font: "sans", marker: "line", align: "start" },
  },
);

type KickerProps = ComponentPropsWithoutRef<"p"> & VariantProps<typeof kickerVariants>;

export function Kicker({ font, marker, align, className, ...props }: KickerProps) {
  return <p className={cn(kickerVariants({ font, marker, align }), className)} {...props} />;
}
