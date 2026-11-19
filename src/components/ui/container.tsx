import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

/**
 * Horizontal content container (`.wrap`). On the 1440 canvas it leaves 86px gutters (72px for
 * `wide`); below 1100px gutters become 36px, and 20px on phones.
 */
const containerVariants = cva(
  "relative mx-auto max-lg:w-[calc(100%_-_72px)] max-md:w-[calc(100%_-_40px)]",
  {
    variants: {
      size: {
        site: "w-[min(var(--container-site),calc(100%_-_172px))]",
        wide: "w-[min(var(--container-wide),calc(100%_-_144px))]",
      },
    },
    defaultVariants: { size: "site" },
  },
);

type ContainerProps = ComponentPropsWithoutRef<"div"> & VariantProps<typeof containerVariants>;

export function Container({ size, className, ...props }: ContainerProps) {
  return <div className={cn(containerVariants({ size }), className)} {...props} />;
}
