import type { SectionAction } from "@/components/sections/section-action";
import { alternatingTone, type Tone } from "@/lib/tone";

/** What `planBlocks` needs from a block: its type and optional tone override. */
export type PlannableBlock = { readonly type: string; readonly tone?: Tone };

/** A block with its resolved tone and a stable React key. */
export type PlannedBlock<B extends PlannableBlock> = {
  readonly block: B;
  readonly tone: Tone;
  readonly index: number;
  readonly key: string;
};

/** The resolved tones of a page's blocks, and the tone of what comes after them (its ending). */
export type BlockPlan<B extends PlannableBlock> = {
  readonly blocks: readonly PlannedBlock<B>[];
  /** Tone of a page ending (contact section) placed after the last block. */
  readonly endingTone: Tone;
};

/**
 * Tone of the block at `index` (after the hero): white and black alternate starting with `first`
 * (white on every inner page of the original, docs/analysis/03 §0, 04 §3). `block.tone` overrides
 * that one block without shifting the others.
 */
export function blockTone(
  block: Pick<PlannableBlock, "tone">,
  index: number,
  first: Tone = "light",
): Tone {
  return block.tone ?? alternatingTone(index, first);
}

/**
 * Tone of a page ending (the contact section): the opposite of the block above it (the original
 * forces it light with `data-fx` after a dark section, and leaves it dark otherwise). Right after
 * the dark hero, it is light.
 */
export function endingTone(previous: Tone | undefined): Tone {
  return previous === "light" ? "dark" : "light";
}

/** Keys and tones of every block of a page, in order. */
export function planBlocks<B extends PlannableBlock>(
  blocks: readonly B[],
  { first = "light" }: { readonly first?: Tone } = {},
): BlockPlan<B> {
  const planned = blocks.map((block, index) => ({
    block,
    tone: blockTone(block, index, first),
    index,
    key: `${String(index)}-${block.type}`,
  }));
  return { blocks: planned, endingTone: endingTone(planned.at(-1)?.tone) };
}

/**
 * Points a "go to contact" action at the page's own form (its no-JavaScript fallback), unless the
 * content gives an explicit target. Without a form on the page (`contactHref` undefined), the
 * action keeps its default target, home's contact section.
 */
export function withContactTarget(
  action: SectionAction,
  contactHref: string | undefined,
): SectionAction {
  return contactHref !== undefined && action.kind === "contact" && action.href === undefined
    ? { ...action, href: contactHref }
    : action;
}
