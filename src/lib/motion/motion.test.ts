import { describe, expect, it } from "vitest";

import {
  COUNT_UP_MS,
  countUpValue,
  easeOutCubic,
  isInViewport,
  parallaxCentre,
  pinProgress,
  revealDelay,
  signatureCentre,
} from "./index";

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

describe("scroll geometry (viewport px)", () => {
  const vh = 900;

  it("pinProgress runs 0 → 1 across the section's scroll travel", () => {
    const height = 3000;
    expect(pinProgress({ top: 200, height }, vh)).toBe(0);
    expect(pinProgress({ top: 0, height }, vh)).toBe(0);
    expect(pinProgress({ top: -1050, height }, vh)).toBe(0.5);
    expect(pinProgress({ top: -2100, height }, vh)).toBe(1);
    expect(pinProgress({ top: -2500, height }, vh)).toBe(1);
  });

  it("pinProgress never divides by zero for sections shorter than the viewport", () => {
    expect(pinProgress({ top: -10, height: 600 }, vh)).toBe(1);
  });

  it("parallaxCentre is 0 when centred and ±0.5 at the edges of visibility", () => {
    expect(parallaxCentre({ top: 250, height: 400 }, vh)).toBe(0);
    expect(parallaxCentre({ top: vh, height: 400 }, vh)).toBe(0.5);
    expect(parallaxCentre({ top: -400, height: 400 }, vh)).toBe(-0.5);
  });

  it("signatureCentre is clamped to −1…1", () => {
    expect(signatureCentre({ top: 0, height: vh }, vh)).toBe(0);
    expect(signatureCentre({ top: 5000, height: vh }, vh)).toBe(1);
    expect(signatureCentre({ top: -5000, height: vh }, vh)).toBe(-1);
  });

  it("isInViewport", () => {
    expect(isInViewport({ top: -399, height: 400 }, vh)).toBe(true);
    expect(isInViewport({ top: -400, height: 400 }, vh)).toBe(false);
    expect(isInViewport({ top: vh, height: 400 }, vh)).toBe(false);
  });
});
