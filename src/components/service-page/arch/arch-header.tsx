import type { ReactNode } from "react";

import { LineBreaks } from "@/components/blocks/title-text";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { cn } from "@/lib/cn";

/**
 * Section title of the architecture page (`#p-architecture .st`): 58px with a 1.14 line height at
 * every width (the page rule out-specifies the global 1.12 / 1.1), still scaling 58 → 46 → 34
 * (KI-N04).
 */
export const ARCH_TITLE = "leading-[1.14] max-md:leading-[1.14]";

/**
 * Copy beside an architecture header (`#p-architecture .sv .p`, `.ap2 .p`, `.pr .lead`): Inter,
 * 58px down from the top of the right column, #ddd on black and the warm muted grey on white.
 */
export const ARCH_HEADER_COPY = "mt-58 font-sans text-mut in-data-[tone=dark]:text-[#ddd]";

type ArchHeaderProps = {
  readonly kicker: string;
  readonly title: readonly string[];
  readonly titleId: string;
  /** Right column (`.two > :last-child`): copy and an optional button. */
  readonly children?: ReactNode;
  readonly className?: string;
};

/**
 * The two-column header of the architecture blocks (`#p-architecture .two`, page `<style>` line
 * 3245): kicker and title (44px below it) in a 646px column, copy on the right, top-aligned (unlike
 * the bottom-aligned `.ks .kh`). One column below 1100px, 36px apart (the copy keeps its 58px
 * offset).
 */
export function ArchHeader({ kicker, title, titleId, children, className }: ArchHeaderProps) {
  return (
    <div className={cn("grid grid-cols-[646px_1fr] max-lg:grid-cols-1 max-lg:gap-36", className)}>
      <div>
        <Kicker>{kicker}</Kicker>
        <SectionTitle id={titleId} className={cn("mt-44", ARCH_TITLE)}>
          <LineBreaks lines={title} />
        </SectionTitle>
      </div>
      <div>{children}</div>
    </div>
  );
}
