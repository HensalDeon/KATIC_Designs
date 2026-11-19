import { describe, expect, it } from "vitest";

import { isContentBlock } from "@/content/blocks";

import { blockTone, endingTone, planBlocks, withContactTarget } from "./block-plan";

const block = (tone?: "light" | "dark") => ({ type: "split", ...(tone ? { tone } : {}) });

describe("block tones (white/black alternate after the hero)", () => {
  it("start white and alternate by index", () => {
    expect([0, 1, 2, 3].map((index) => blockTone({}, index))).toEqual([
      "light",
      "dark",
      "light",
      "dark",
    ]);
  });

  it("can start black", () => {
    expect([0, 1].map((index) => blockTone({}, index, "dark"))).toEqual(["dark", "light"]);
  });

  it("let one block override its tone without shifting the others", () => {
    const plan = planBlocks([block(), block("light"), block()]);
    expect(plan.blocks.map(({ tone }) => tone)).toEqual(["light", "light", "light"]);
  });

  it("keep order, indexes and unique keys", () => {
    const blocks = [block(), { type: "cards" }, block()];
    const plan = planBlocks(blocks);
    expect(plan.blocks.map(({ block: b }) => b)).toEqual(blocks);
    expect(plan.blocks.map(({ index }) => index)).toEqual([0, 1, 2]);
    expect(new Set(plan.blocks.map(({ key }) => key)).size).toBe(3);
  });
});

describe("page ending tone", () => {
  it("is the opposite of the last block, and light right after the hero", () => {
    expect(endingTone("light")).toBe("dark");
    expect(endingTone("dark")).toBe("light");
    expect(endingTone(undefined)).toBe("light");
    expect(planBlocks([block(), block()]).endingTone).toBe("light");
    expect(planBlocks([block()]).endingTone).toBe("dark");
    expect(planBlocks([]).endingTone).toBe("light");
  });
});

describe("go-to-contact targets", () => {
  it("point at the page's form when it has one", () => {
    expect(withContactTarget({ kind: "contact", label: "Go" }, "#x-contact")).toEqual({
      kind: "contact",
      label: "Go",
      href: "#x-contact",
    });
  });

  it("keep the default target on pages without a form, and leave other actions alone", () => {
    const action = { kind: "contact", label: "Go" } as const;
    const popup = { kind: "enquiry", label: "Start" } as const;
    expect(withContactTarget(action, undefined)).toBe(action);
    expect(withContactTarget(popup, "#x")).toBe(popup);
  });
});

describe("isContentBlock", () => {
  it("tells generic blocks from page-specific ones", () => {
    expect(isContentBlock({ type: "divisionCards" })).toBe(true);
    expect(isContentBlock({ type: "cards" })).toBe(true);
    expect(isContentBlock({ type: "archIntro" })).toBe(false);
  });
});
