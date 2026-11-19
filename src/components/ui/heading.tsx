import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

/**
 * Section title (`.st`). Uppercase Jost on the 1440 canvas, 46px below 1100px and 34px on phones.
 * The original fails to scale it at 1024 on several pages; this component always scales (KI-N04).
 */
const sectionTitleVariants = cva(
  "font-display text-fg uppercase max-lg:text-[46px] max-md:text-[34px]",
  {
    variants: {
      scale: {
        /** Inner pages: Jost 400 58/1.12. */
        standard: "text-[58px] leading-[1.12] font-normal tracking-[-0.005em] max-md:leading-[1.1]",
        /** Home page: Jost 500 56/1.02 ("one font, one scale"). */
        home: "text-[56px] leading-[1.02] font-medium tracking-normal",
      },
    },
    defaultVariants: { scale: "standard" },
  },
);

type HeadingLevel = "h1" | "h2" | "h3";

type SectionTitleProps = ComponentPropsWithoutRef<"h2"> &
  VariantProps<typeof sectionTitleVariants> & { as?: HeadingLevel | undefined };

export function SectionTitle({
  as: Tag = "h2",
  scale,
  className,
  children,
  ...props
}: SectionTitleProps) {
  return (
    <Tag className={cn(sectionTitleVariants({ scale }), className)} {...props}>
      {children}
    </Tag>
  );
}

/**
 * Hero banner title (`.h1`): Jost 700 in white over imagery. 62px below 1100px on every page
 * (the original only scales Home, KI-L16) and fluid on phones.
 */
const heroTitleVariants = cva(
  "font-display font-bold tracking-[-0.005em] text-white max-lg:text-[62px] max-md:text-[clamp(32px,9.6vw,42px)] max-md:leading-[1.05] max-md:tracking-[-0.01em]",
  {
    variants: {
      scale: {
        standard: "text-[76px] leading-[0.96]",
        home: "text-[78px] leading-[0.93]",
        /** Service-page banners (`.kh-hero`). */
        service: "text-[74px] leading-none",
      },
    },
    defaultVariants: { scale: "standard" },
  },
);

type HeroTitleProps = ComponentPropsWithoutRef<"h1"> & VariantProps<typeof heroTitleVariants>;

export function HeroTitle({ scale, className, children, ...props }: HeroTitleProps) {
  return (
    <h1 className={cn(heroTitleVariants({ scale }), className)} {...props}>
      {children}
    </h1>
  );
}

/** Orange emphasis inside titles (`.or`). */
export function Accent({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return <span className={cn("text-brand", className)} {...props} />;
}
