import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

const moreLinkVariants = cva("inline-flex items-center gap-10 text-fg uppercase", {
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

type MoreLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "children"> &
  VariantProps<typeof moreLinkVariants> & { children: string };

/** "Explore service →" style link with an orange arrow (`.k-more`). */
export function MoreLink({ font, className, children, ...props }: MoreLinkProps) {
  return (
    <Link className={cn(moreLinkVariants({ font }), className)} {...props}>
      {children}
      <b className="text-brand" aria-hidden>
        →
      </b>
    </Link>
  );
}

/** Underlined orange uppercase link (`.tlink`). */
export function UnderlineLink({ className, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-block border-b border-brand pb-2 font-display text-[10px] font-medium tracking-[0.2em] text-brand uppercase max-md:text-[11px]",
        className,
      )}
      {...props}
    />
  );
}
