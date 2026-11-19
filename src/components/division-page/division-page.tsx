import { BlockHero } from "@/components/blocks/block-hero";
import { BlockStack } from "@/components/blocks/block-stack";
import { divisionPageBlocks } from "@/content/divisions/shared";
import type { DivisionPageContent } from "@/content/divisions/types";

type DivisionPageProps = {
  readonly content: DivisionPageContent;
};

/**
 * A division page (`#p-div-<slug>`, reference/original/katic-designs-final.stripped.html
 * 3978–4047; docs/analysis/04 §3): the shared `.kh-hero` banner, the page's blocks with
 * white/black alternating after it, then "Explore our divisions" (the other four). No contact
 * section: the page ends with that grid, then the footer. Server component; nothing reveals on
 * scroll (D7), only the section islands hydrate (line-art draw-on, lightbox).
 */
export function DivisionPage({ content }: DivisionPageProps) {
  return (
    <>
      <BlockHero hero={content.hero} />
      <BlockStack blocks={divisionPageBlocks(content)} />
    </>
  );
}
