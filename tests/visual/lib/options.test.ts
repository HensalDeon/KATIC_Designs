import { describe, expect, it } from "vitest";

import {
  blockFileStem,
  blockSelector,
  diffRecords,
  heightsStable,
  notMatchedByIdSuffix,
  parityStatus,
  parseProps,
  pick,
  splitList,
} from "./options";

describe("splitList", () => {
  it("splits, trims and drops empty items", () => {
    expect(splitList(" a.css, b.css,,c.css ")).toEqual(["a.css", "b.css", "c.css"]);
  });
  it("returns [] for a missing value", () => {
    expect(splitList(undefined)).toEqual([]);
    expect(splitList("")).toEqual([]);
  });
});

describe("pick", () => {
  const all = [{ id: "home" }, { id: "about" }, { id: "works" }];
  it("returns everything without a list", () => {
    expect(pick(all, undefined, (r) => r.id)).toBe(all);
  });
  it("keeps the canonical order", () => {
    expect(pick(all, "works,home", (r) => r.id).map((r) => r.id)).toEqual(["home", "works"]);
  });
  it("throws on unknown names", () => {
    expect(() => pick(all, "home,abuot", (r) => r.id, "route")).toThrow(
      /Unknown route\(s\): abuot/,
    );
  });
});

describe("heightsStable", () => {
  it("needs a previous measurement of the same length", () => {
    expect(heightsStable(null, [100])).toBe(false);
    expect(heightsStable([100], [100, 200])).toBe(false);
  });
  it("accepts sub-pixel jitter within the tolerance", () => {
    expect(heightsStable([1000, 400.2], [1000, 400.6])).toBe(true);
  });
  it("rejects growth beyond the tolerance (e.g. the original's plant padding, KI-N11)", () => {
    expect(heightsStable([1000, 400], [1012, 412])).toBe(false);
    expect(heightsStable([400], [401], 2)).toBe(true);
  });
});

describe("parityStatus", () => {
  it("applies the P4-04 bands", () => {
    expect(parityStatus(0.4, 1)).toBe("pass");
    expect(parityStatus(1, 1)).toBe("pass");
    expect(parityStatus(1.6, 1)).toBe("review");
    expect(parityStatus(2.01, 1)).toBe("fail");
  });
});

describe("blockSelector", () => {
  it("matches by id first", () => {
    expect(blockSelector({ id: "home-about", className: "sec" })).toBe("#home-about");
  });
  it("maps the hero and the footer", () => {
    expect(blockSelector({ id: null, className: "hero kh-hero" })).toBe("[data-hero]");
    expect(blockSelector({ id: null, className: "ftw" })).toBe("[data-parity=footer]");
  });
  it("falls back to the first class, excluding blocks matched by id", () => {
    const first = { id: null, className: "ks dk" };
    const blocks = [first, { id: "ba", className: "ks" }];
    const suffix = notMatchedByIdSuffix(blocks);
    expect(suffix).toBe(":not(#ba)");
    expect(blockSelector(first, suffix)).toBe('[data-parity="ks"]:not(#ba)');
  });
  it("returns null for a block without id or class", () => {
    expect(blockSelector({ id: null, className: "" })).toBeNull();
  });
});

describe("blockFileStem", () => {
  it("numbers and slugs the block label", () => {
    expect(blockFileStem(0, { id: null, className: "hero kh-hero", tag: "section" })).toBe(
      "01-hero",
    );
    expect(blockFileStem(9, { id: "about_contact", className: "", tag: "section" })).toBe(
      "10-about-contact",
    );
    expect(blockFileStem(2, { id: null, className: "", tag: "div" })).toBe("03-div");
  });
});

describe("parseProps", () => {
  it("camel-cases kebab-case names", () => {
    expect(parseProps("font-size, lineHeight", [])).toEqual(["fontSize", "lineHeight"]);
  });
  it("uses the fallback without a list", () => {
    expect(parseProps(undefined, ["color"])).toEqual(["color"]);
  });
});

describe("diffRecords", () => {
  it("lists only the differing keys", () => {
    expect(
      diffRecords(
        { fontSize: "58px", rect: [0, 1, 2, 3], color: "red" },
        { fontSize: "46px", rect: [0, 1, 2, 3] },
      ),
    ).toEqual({ fontSize: ["58px", "46px"], color: ["red", undefined] });
  });
});
