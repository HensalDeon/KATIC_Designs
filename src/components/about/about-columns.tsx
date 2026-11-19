import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Title classes shared by the About page's section titles: `#p-about .st` keeps its 1.12 line
 * height on phones, where the generic `.st` uses 1.1.
 */
export const ABOUT_TITLE_CLASS = "max-md:leading-[1.12]";

type AboutColumnsProps = {
  /** Kicker and title (the 646px column). */
  readonly start: ReactNode;
  /** Lead, copy and action. */
  readonly end: ReactNode;
  readonly endClassName?: string;
  readonly className?: string;
};

/**
 * The About page's two-column intro row (`#p-about .two`): the kicker and title in a 646px column,
 * the copy beside it, both top-aligned. One column 36px apart below 1100px. Used by the "Who we
 * are", experience, team and works sections.
 */
export function AboutColumns({ start, end, endClassName, className }: AboutColumnsProps) {
  return (
    <div className={cn("grid grid-cols-[646px_1fr] max-lg:grid-cols-1 max-lg:gap-36", className)}>
      <div>{start}</div>
      <div className={endClassName}>{end}</div>
    </div>
  );
}
