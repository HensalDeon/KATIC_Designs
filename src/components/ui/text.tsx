import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

/** Introductory paragraph under a title (`.lead`). All leads are 15px on phones. */
const leadVariants = cva("max-md:text-[15px]", {
  variants: {
    variant: {
      /** `.lead`: Jost 15/1.75. */
      base: "font-display text-[15px] leading-[1.75]",
      /** Section header lead (`.ks .kh .lead`): Inter 16/1.8, muted by tone. */
      section: "max-w-600 font-sans text-[16px] leading-[1.8] text-fg-muted",
      /** Hero banner lead (`.kh-hero .lead`): Inter 17/1.7 on imagery. */
      hero: "max-w-640 font-sans text-[17px] leading-[1.7] text-mist max-md:leading-[1.6]",
      /** Home page section lead: Jost 15/1.75, muted by tone. */
      home: "font-display text-[15px] leading-[1.75] text-fg-muted",
    },
  },
  defaultVariants: { variant: "section" },
});

type LeadProps = ComponentPropsWithoutRef<"p"> & VariantProps<typeof leadVariants>;

export function Lead({ variant, className, ...props }: LeadProps) {
  return <p className={cn(leadVariants({ variant }), className)} {...props} />;
}

/** Body copy (`.p`). */
const bodyVariants = cva("font-sans", {
  variants: {
    variant: {
      /** `.p`: Inter 13/1.75 in the warm muted grey. */
      base: "text-[13px] leading-[1.75] text-fg-mut",
      /** Paragraphs inside sections (`.ks .p`): Inter 14/1.9. */
      section: "text-[14px] leading-[1.9] text-fg-body",
    },
  },
  defaultVariants: { variant: "section" },
});

type BodyProps = ComponentPropsWithoutRef<"p"> & VariantProps<typeof bodyVariants>;

export function Body({ variant, className, ...props }: BodyProps) {
  return <p className={cn(bodyVariants({ variant }), className)} {...props} />;
}
