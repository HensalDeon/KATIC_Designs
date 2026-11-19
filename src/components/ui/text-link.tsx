import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

export const moreLinkVariants = cva("inline-flex items-center gap-10 text-fg uppercase", {
  variants: {
    font: {
      /** `.k-more`: Inter 600 11px. */
      sans: "font-sans text-[11px] font-semibold tracking-[0.12em]",
      /** Home page: Jost 500 11.5px. */
      home: "font-display text-[11.5px] font-medium tracking-[0.14em]",
    },
  },
  defaultVariants: { font: "sans" },
});

/** The orange arrow of `.k-more`: text-safe orange on white, brand orange on black (KI-A11). */
export function MoreArrow({ className }: { className?: string }) {
  return (
    <b className={cn("text-kicker", className)} aria-hidden>
      →
    </b>
  );
}

/** The `.k-more` label as plain text, for use inside a larger link (e.g. a whole card). */
export function MoreLabel({
  font,
  className,
  children,
}: VariantProps<typeof moreLinkVariants> & { className?: string; children: string }) {
  return (
    <span className={cn(moreLinkVariants({ font }), className)}>
      {children}
      <MoreArrow className="font-black" />
    </span>
  );
}
