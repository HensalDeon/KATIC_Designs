/** Every section of the site is pure white or pure black (decision D3). */
export type Tone = "light" | "dark";

/**
 * Tone of the section at `index` in a page that alternates white/black, starting with `first`.
 * The original alternates strictly after the hero; pages pass `toneOverride` where they diverge.
 */
export function alternatingTone(index: number, first: Tone = "light"): Tone {
  const other: Tone = first === "light" ? "dark" : "light";
  return index % 2 === 0 ? first : other;
}
