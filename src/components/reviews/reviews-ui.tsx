import type { ReactNode } from "react";

import { LineBreaks } from "@/components/blocks/title-text";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import type { TitleLines } from "@/content/blocks";
import { cn } from "@/lib/cn";

/**
 * `#p-reviews .st{font-size:58px;line-height:1.14}` (page `<style>` 4224): the page's section
 * titles keep a 1.14 line height at every size (P1-04 page override of `SectionTitle`); the size
 * still scales 58 → 46 → 34 (KI-N04).
 */
export const REVIEWS_TITLE_CLASS = "mt-22 leading-[1.14] max-md:leading-[1.14]";

/** Kicker and section title (`.kick.int` + `h2.st` with its inline 22px top margin). */
export function ReviewsHeading({
  kicker,
  title,
}: {
  readonly kicker: string;
  readonly title: TitleLines;
}) {
  return (
    <>
      <Kicker>{kicker}</Kicker>
      <SectionTitle className={REVIEWS_TITLE_CLASS}>
        <LineBreaks lines={title} />
      </SectionTitle>
    </>
  );
}

/**
 * The page's header row (inline `display:flex;justify-content:space-between` in the original):
 * heading block left, an action or facts right. On phones it stacks with a 20px gap, left-aligned
 * (`[style*="justify-content:space-between"]`, line 2276; KI-L26).
 */
export function SplitHeader({
  align,
  aside,
  children,
}: {
  /** `end` aligns the aside with the bottom of the heading block, `start` with its top. */
  readonly align: "start" | "end";
  readonly aside: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex justify-between max-md:flex-col max-md:items-start max-md:gap-20",
        align === "end" ? "items-end" : "items-start",
      )}
    >
      <div>{children}</div>
      {aside}
    </div>
  );
}
