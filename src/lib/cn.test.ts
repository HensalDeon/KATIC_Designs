import { describe, expect, it } from "vitest";

import { cn } from "./cn";

/**
 * The design system uses custom theme tokens (text-fg, text-kicker, h-52, py-120, …). These tests
 * pin down which classes survive tailwind-merge's conflict resolution.
 *
 * Comparison is order-independent: Prettier's Tailwind plugin re-sorts the class strings passed
 * to `cn()` in source, and the order of surviving classes carries no meaning.
 */
const classes = (value: string) => value.split(/\s+/).filter(Boolean).sort();

describe("cn", () => {
  it("keeps a tone colour and an arbitrary font size side by side", () => {
    expect(classes(cn("text-[58px] text-fg"))).toEqual(classes("text-fg text-[58px]"));
  });

  it("lets later font sizes and colours win", () => {
    expect(classes(cn("text-[58px] text-fg", "text-[46px] text-brand"))).toEqual(
      classes("text-[46px] text-brand"),
    );
  });

  it("resolves 1px-unit spacing and sizing conflicts", () => {
    expect(classes(cn("h-52 gap-22 px-24", "h-46 px-22"))).toEqual(classes("gap-22 h-46 px-22"));
    expect(classes(cn("py-120 max-lg:py-80", "py-0"))).toEqual(classes("max-lg:py-80 py-0"));
  });

  it("keeps responsive variants separate from the base class", () => {
    const input = "text-[58px] max-lg:text-[46px] max-md:text-[34px]";
    expect(classes(cn(input))).toEqual(classes(input));
  });
});
