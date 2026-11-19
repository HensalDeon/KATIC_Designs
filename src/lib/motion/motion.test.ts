import { describe, expect, it } from "vitest";

import { COUNT_UP_MS, countUpValue, easeOutCubic, revealDelay } from "./index";

describe("revealDelay", () => {
  it("staggers by 0.09s and caps at the 6th item", () => {
    expect([0, 1, 5, 6, 12].map(revealDelay)).toEqual([0, 0.09, 0.45, 0.54, 0.54]);
  });
});

describe("easeOutCubic", () => {
  it("is clamped to 0..1 and front-loaded", () => {
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(0.5)).toBe(0.875);
    expect(easeOutCubic(2)).toBe(1);
  });
});

describe("countUpValue", () => {
  it("starts at 0, eases, and lands exactly on the target", () => {
    expect(countUpValue(200, 0)).toBe(0);
    expect(countUpValue(200, COUNT_UP_MS / 2)).toBe(175);
    expect(countUpValue(200, COUNT_UP_MS)).toBe(200);
    expect(countUpValue(200, COUNT_UP_MS * 2)).toBe(200);
  });
});
