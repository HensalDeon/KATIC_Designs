import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

/** Rounded outline label (`.chip`). */
export function Chip({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex h-20 items-center rounded-[20px] border border-chip-line px-9 font-sans text-[8.5px] font-medium tracking-[0.14em] uppercase max-md:text-[11px]",
        className,
      )}
      {...props}
    />
  );
}

/** Solid dark label placed over imagery (`.tag`). */
export function Tag({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center bg-panel px-9 py-7 font-sans text-[9px] font-medium tracking-[0.14em] text-white uppercase max-md:text-[11px]",
        className,
      )}
      {...props}
    />
  );
}
