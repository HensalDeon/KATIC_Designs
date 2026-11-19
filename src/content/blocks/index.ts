import type { ContentBlock, ContentBlockType } from "./types";

export { TESTIMONIALS_HEADER } from "./shared";
export type * from "./types";

/** Every `ContentBlock` type literal (checked against the union below). */
export const CONTENT_BLOCK_TYPES = [
  "split",
  "rows",
  "features",
  "process",
  "sectors",
  "projects",
  "products",
  "cards",
  "gallery",
  "beforeAfter",
  "related",
  "divisionCards",
  "divisions",
  "testimonials",
] as const satisfies readonly ContentBlockType[];

/** Adding a member to `ContentBlock` without listing it above is a type error here. */
type UnlistedBlockType = Exclude<ContentBlockType, (typeof CONTENT_BLOCK_TYPES)[number]>;
export const ALL_BLOCK_TYPES_LISTED: [UnlistedBlockType] extends [never] ? true : never = true;

const BLOCK_TYPES: ReadonlySet<string> = new Set(CONTENT_BLOCK_TYPES);

/**
 * Whether a page's block is a generic `ContentBlock` (rendered by `BlockSection`) rather than one
 * of the page family's bespoke blocks.
 */
export function isContentBlock<B extends { readonly type: string }>(
  block: B,
): block is Extract<B, ContentBlock> {
  return BLOCK_TYPES.has(block.type);
}
