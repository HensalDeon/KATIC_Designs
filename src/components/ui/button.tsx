import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { type ArrowDirection, ArrowIcon } from "@/components/icons/arrow-icon";
import { cn } from "@/lib/cn";

/**
 * Button styles (`.btn`). Colour variants map 1:1 to the original's modifier classes; sizes are the
 * presets the original actually renders. Page-specific tweaks are applied with `className`.
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center gap-14 font-sans font-medium whitespace-nowrap transition-[background-color,color,border-color] duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /** `.wh`: cream → white. */
        light: "bg-cream text-ink-2 hover:bg-white",
        /** `.ol`: white with warm grey border → dark border. */
        outline: "border border-line bg-white text-ink-2 hover:border-ink-2",
        /** `.olc`: transparent outline on light. */
        "outline-clear": "border border-line bg-transparent text-ink-2",
        /** `.dk`: near-black with translucent white border → white border. */
        dark: "border border-[rgba(255,255,255,0.28)] bg-ink-2 text-white hover:border-white",
        /** `.dko`: transparent outline on dark/imagery. */
        "outline-light": "border border-[rgba(255,255,255,0.4)] bg-transparent text-white",
        /** `.dko` on a light section (home divisions): dark outline. */
        "outline-ink": "border border-ink-2 bg-transparent text-ink-2",
        /** `.orf`: brand orange → darker orange. */
        primary: "bg-brand text-white hover:bg-brand-hover",
      },
      size: {
        /** `.btn`: 52px, Inter 500 13.5px. */
        base: "h-52 px-28 text-[13.5px]",
        /** `.ks .btn` (standard on inner pages): 52px, Inter 600 12.5px. */
        section: "h-52 gap-22 px-24 text-[12.5px] font-semibold",
        /** `.kh-hero .btn` (service banners): 54px. */
        hero: "h-54 gap-22 px-26 text-[12.5px] font-semibold",
        /** `.btn.sm`: 46px. */
        sm: "h-46 px-22 text-[12.5px]",
        /** `.btn.xs`: 40px. */
        xs: "h-40 px-20 text-[11.5px]",
      },
      font: {
        sans: "",
        /** Home page buttons: Jost 500 12px, uppercase, wide tracking. */
        home: "font-display text-[12px] font-medium tracking-[0.16em] uppercase",
      },
    },
    defaultVariants: { variant: "light", size: "section", font: "sans" },
  },
);

type ButtonStyleProps = VariantProps<typeof buttonVariants> & {
  /** Trailing arrow; `null` for none. */
  icon?: ArrowDirection | null;
};

function ButtonContent({ children, icon }: { children: ReactNode; icon: ArrowDirection | null }) {
  return (
    <>
      {children}
      {icon ? <ArrowIcon direction={icon} className="flex-none" /> : null}
    </>
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & ButtonStyleProps;

export function Button({
  variant,
  size,
  font,
  icon = "right",
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, font }), className)}
      {...props}
    >
      <ButtonContent icon={icon}>{children}</ButtonContent>
    </button>
  );
}

type ButtonLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "children"> &
  ButtonStyleProps & {
    children: ReactNode;
  };

/**
 * A link styled as a button. `next/link` also handles absolute URLs, `tel:` and `mailto:` (no
 * prefetching for those), so one component covers internal and external targets.
 */
export function ButtonLink({
  variant,
  size,
  font,
  icon = "right",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size, font }), className)} {...props}>
      <ButtonContent icon={icon}>{children}</ButtonContent>
    </Link>
  );
}
