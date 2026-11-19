import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tone";

/**
 * Page section shell (`.ks` / `.ks.dk`). Sets the tone (pure white or pure black) for everything
 * inside it via `data-tone`, so children use tone-aware colours (`text-fg`, `text-kicker`, …).
 *
 * On the desktop canvas every regular section is at least one screen tall with its content centred
 * vertically (the original's one-screen rhythm). Content taller than a screen simply grows: the
 * original's `fit()` auto-zoom is intentionally not reproduced (decision D4, KI-L13).
 */
const sectionVariants = cva("relative overflow-hidden bg-surface text-fg", {
  variants: {
    spacing: {
      /** Inner pages: 120px top and bottom on the canvas, 80px below 1100px. */
      standard: "py-120 max-lg:py-80",
      /** Home page rhythm. */
      home: "pt-104 pb-36",
      none: "",
    },
    fullHeight: {
      true: "lg:flex lg:min-h-[var(--svh)] lg:flex-col lg:justify-center lg:*:shrink-0",
      false: "",
    },
  },
  defaultVariants: { spacing: "standard", fullHeight: true },
});

type SectionProps = ComponentPropsWithoutRef<"section"> &
  VariantProps<typeof sectionVariants> & {
    tone: Tone;
  };

export function Section({ tone, spacing, fullHeight, className, ...props }: SectionProps) {
  return (
    <section
      data-tone={tone}
      className={cn(sectionVariants({ spacing, fullHeight }), className)}
      {...props}
    />
  );
}
