import { describe, expect, it } from "vitest";

import {
  type AutoplayConditions,
  autoplayPhase,
  swipeStep,
  wrapIndex,
} from "./services-explorer-autoplay";

const base: AutoplayConditions = {
  visible: true,
  reducedMotion: false,
  paused: false,
  hovered: false,
  focused: false,
  documentHidden: false,
};

describe("autoplayPhase", () => {
  it("runs only in view, with motion allowed and nothing holding it", () => {
    expect(autoplayPhase(base)).toBe("running");
  });

  it("is off out of view, under reduced motion and when paused by the visitor", () => {
    expect(autoplayPhase({ ...base, visible: false })).toBe("off");
    expect(autoplayPhase({ ...base, reducedMotion: true })).toBe("off");
    expect(autoplayPhase({ ...base, paused: true })).toBe("off");
    expect(autoplayPhase({ ...base, paused: true, hovered: true })).toBe("off");
  });

  it("holds while hovered, focused or in a hidden tab", () => {
    expect(autoplayPhase({ ...base, hovered: true })).toBe("held");
    expect(autoplayPhase({ ...base, focused: true })).toBe("held");
    expect(autoplayPhase({ ...base, documentHidden: true })).toBe("held");
  });
});

describe("wrapIndex", () => {
  it("wraps in both directions", () => {
    expect(wrapIndex(0, 1, 5)).toBe(1);
    expect(wrapIndex(4, 1, 5)).toBe(0);
    expect(wrapIndex(0, -1, 5)).toBe(4);
    expect(wrapIndex(2, -7, 5)).toBe(0);
  });
});

describe("swipeStep", () => {
  it("needs more than 45px; a leftward swipe goes forward", () => {
    expect(swipeStep(-45)).toBe(0);
    expect(swipeStep(45)).toBe(0);
    expect(swipeStep(-46)).toBe(1);
    expect(swipeStep(80)).toBe(-1);
  });
});
