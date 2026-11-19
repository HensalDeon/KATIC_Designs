import type { BespokeOf } from "@/components/blocks/block-stack";
import { BlockStack } from "@/components/blocks/block-stack";
import { ContactSection } from "@/components/sections/contact-section";
import {
  DUBAI_BLOCKS,
  DUBAI_CONTACT,
  DUBAI_HERO,
  DUBAI_IDS,
  type DubaiBlock,
} from "@/content/locations/dubai";
import type { Tone } from "@/lib/tone";

import { DubaiContext } from "./dubai-context";
import { DubaiHero } from "./dubai-hero";
import { DubaiOffice } from "./dubai-office";
import { DubaiProjects } from "./dubai-projects";
import { DUBAI_TITLE } from "./dubai-title";

/** Renders a Dubai-only block with the tone the block plan gives it. Exhaustive. */
function DubaiBespokeBlock({ block, tone }: { block: BespokeOf<DubaiBlock>; tone: Tone }) {
  const id = block.id ? { id: block.id } : {};
  switch (block.type) {
    case "dubaiContext":
      return <DubaiContext content={block} tone={tone} {...id} />;
    case "dubaiOffice":
      return <DubaiOffice content={block} tone={tone} {...id} />;
    case "dubaiProjects":
      return <DubaiProjects content={block} tone={tone} {...id} />;
    default:
      return assertNever(block);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled Dubai block: ${JSON.stringify(value)}`);
}

/**
 * The Dubai location page (`#p-dubai`, original lines 4097–4215, docs/analysis/04 §8): its own
 * banner (`DubaiHero`), then the blocks through the shared `BlockStack` (white/black alternating
 * from white; generic blocks through `BlockSection`, the Dubai-only intro, office and project
 * mosaic through `DubaiBespokeBlock`), then the page's own contact section in the opposite tone
 * of the mosaic (white, as the original's `data-fx=169`). Section titles use the page's 1.14 line
 * height (`DUBAI_TITLE`). Server component; nothing reveals on scroll (D7).
 */
export function DubaiPage() {
  return (
    <>
      <DubaiHero content={DUBAI_HERO} />
      <BlockStack<DubaiBlock>
        blocks={DUBAI_BLOCKS}
        context={{ contactHref: `#${DUBAI_IDS.contact}`, titleClassName: DUBAI_TITLE }}
        renderBespoke={(block, { tone }) => <DubaiBespokeBlock block={block} tone={tone} />}
        ending={(tone) => (
          <ContactSection
            id={DUBAI_IDS.contact}
            tone={tone}
            colors="local"
            content={DUBAI_CONTACT}
          />
        )}
      />
    </>
  );
}
