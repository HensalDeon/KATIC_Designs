import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge assumes font-size utilities also set line-height (true for Tailwind's named
 * sizes), so `leading-[1.8] text-[16px]` would drop the leading. This design system only uses
 * arbitrary sizes, which never set line-height, so font size and leading are independent here.
 */
const twMerge = extendTailwindMerge({
  override: { conflictingClassGroups: { "font-size": [] } },
});

/** Joins class names and resolves Tailwind conflicts (the last class wins). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
