import { Fragment, type ReactNode } from "react";

import { type ContentBlock, isContentBlock } from "@/content/blocks";
import type { Tone } from "@/lib/tone";

import { planBlocks, type PlannableBlock, type PlannedBlock } from "./block-plan";
import { type BlockContext, BlockSection } from "./block-section";

/** Members of a page's block union that are not generic `ContentBlock`s. */
export type BespokeOf<B> = Exclude<B, ContentBlock>;

/** Renders one page-specific block with its resolved tone. */
export type RenderBespoke<B extends PlannableBlock> = (
  block: BespokeOf<B>,
  planned: Omit<PlannedBlock<B>, "block">,
) => ReactNode;

type BlockStackBaseProps<B extends PlannableBlock> = {
  readonly blocks: readonly B[];
  /** Page-level settings (contact target, title classes) passed to every block. */
  readonly context?: BlockContext;
  /** Tone of the first block (default white, as on every inner page). */
  readonly first?: Tone;
  /**
   * What closes the page after the blocks (e.g. the contact section), given the tone opposite to
   * the last block's. Omit for pages that end with their last block (division pages).
   */
  readonly ending?: (tone: Tone) => ReactNode;
};

/** `renderBespoke` is required exactly when the page's union has members beyond `ContentBlock`. */
export type BlockStackProps<B extends PlannableBlock> = BlockStackBaseProps<B> &
  ([BespokeOf<B>] extends [never]
    ? { readonly renderBespoke?: undefined }
    : { readonly renderBespoke: RenderBespoke<B> });

/**
 * A page's blocks in order, with white/black alternating after the hero (`planBlocks`), then the
 * optional ending in the opposite tone of the last block. Generic blocks render through
 * `BlockSection`; page-specific ones through `renderBespoke`. Server component.
 */
export function BlockStack<B extends PlannableBlock>(props: BlockStackProps<B>) {
  const { blocks, context, first, ending } = props;
  const plan = planBlocks(blocks, first ? { first } : {});

  return (
    <>
      {plan.blocks.map(({ block, tone, index, key }) => {
        if (isContentBlock(block)) {
          return (
            <BlockSection key={key} block={block} tone={tone} {...(context ? { context } : {})} />
          );
        }
        const render = props.renderBespoke;
        if (!render || !isBespoke(block)) {
          throw new Error(`No renderer for page-specific block "${block.type}"`);
        }
        return <Fragment key={key}>{render(block, { tone, index, key })}</Fragment>;
      })}
      {ending ? ending(plan.endingTone) : null}
    </>
  );
}

/** The complement of `isContentBlock`, typed for `renderBespoke`. */
function isBespoke<B extends PlannableBlock>(block: B): block is B & BespokeOf<B> {
  return !isContentBlock(block);
}
