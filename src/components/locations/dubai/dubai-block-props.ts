import type { Tone } from "@/lib/tone";

/** Props of a Dubai-only block: its copy, the tone the page's block plan gives it, and its id. */
export type DubaiBlockProps<C> = {
  readonly content: C;
  readonly tone: Tone;
  /** The original's deep-link id; each block defaults to its own. */
  readonly id?: string;
};
