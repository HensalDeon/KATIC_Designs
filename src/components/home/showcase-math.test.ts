import { describe, expect, it } from "vitest";

import {
  activeStage,
  cardPoseVars,
  centredCard,
  coverFlowPose,
  defaultStageTravel,
  px3,
  showcaseHeight,
  showcasePosition,
  stageIsDrawn,
  stageOffset,
  stagesHeight,
  stageTravel,
} from "./showcase-math";

/* Expected values were measured on the original site (coverage/h2/orig.json, 1440×900 and 1920×1080). */

describe("cover-flow pose", () => {
  it("centres the card at the current position", () => {
    expect(coverFlowPose(5, 5)).toEqual({
      x: 0,
      y: 0,
      scale: 1,
      shade: 0,
      zIndex: 20,
      centred: true,
    });
  });

  it("puts a neighbour 640px away, 16px lower, scaled .93, fully shaded (original values)", () => {
    const right = coverFlowPose(1, 0);
    expect(right).toMatchObject({ x: 640, y: 16, shade: 1, zIndex: 18, centred: false });
    expect(right.scale).toBeCloseTo(0.93, 10);
    const left = coverFlowPose(0, 1);
    expect(left.x).toBe(-640);
    expect(left.y).toBe(16);
  });

  it("caps the drop and shade at one step and the shrink at 1.5 steps", () => {
    const far = coverFlowPose(4, 0);
    expect(far).toMatchObject({ x: 2560, y: 16, shade: 1, zIndex: 12 });
    expect(far.scale).toBeCloseTo(1 - 1.5 * 0.07, 10);
    expect(coverFlowPose(3, 1.5).scale).toBeCloseTo(0.895, 10);
  });

  it("interpolates between cards", () => {
    const pose = coverFlowPose(3, 2.75);
    expect(pose.x).toBeCloseTo(160, 10);
    expect(pose.y).toBeCloseTo(4, 10);
    expect(pose.scale).toBeCloseTo(0.9825, 10);
    expect(pose.shade).toBeCloseTo(0.25, 10);
    expect(pose.zIndex).toBe(20 - Math.round(0.5));
    expect(pose.centred).toBe(true);
  });

  it("maps progress to a fractional card index", () => {
    expect(showcasePosition(0, 11)).toBe(0);
    expect(showcasePosition(0.5, 11)).toBe(5);
    expect(showcasePosition(1, 11)).toBe(10);
    expect(showcasePosition(1, 1)).toBe(0);
  });

  it("finds the centred card, or none exactly between two cards (as the original)", () => {
    expect(centredCard(0, 11)).toBe(0);
    expect(centredCard(0.5, 11)).toBe(5);
    expect(centredCard(1, 11)).toBe(10);
    expect(centredCard(0.25, 11)).toBe(-1); // position 2.5
    expect(centredCard(0.26, 11)).toBe(3);
    expect(centredCard(0.3, 1)).toBe(0);
  });

  it("formats the pose as CSS custom properties", () => {
    expect(cardPoseVars(coverFlowPose(1, 0))).toEqual({
      "--sc-x": "640px",
      "--sc-y": "16px",
      "--sc-s": "0.93",
      "--sh": "1.000",
      "--sc-z": "18",
    });
    expect(cardPoseVars(coverFlowPose(0, 0))["--sc-x"]).toBe("0px");
    expect(px3(-0.0001)).toBe(0);
    expect(px3(639.87654)).toBe(639.877);
  });
});

describe("showcase height", () => {
  it("is vh × (1 + (n − 1) × 0.6) in canvas px", () => {
    expect(showcaseHeight(900, 11)).toBeCloseTo(6300, 6); // 1440×900
    expect(showcaseHeight(810, 11)).toBeCloseTo(5670, 6); // 1920×1080: vh = 1080 / 1.3333
    expect(showcaseHeight(900, 5)).toBeCloseTo(3060, 6); // Residential
    expect(showcaseHeight(900, 4)).toBeCloseTo(2520, 6); // Commercial, Architecture
    expect(showcaseHeight(900, 3)).toBeCloseTo(1980, 6); // Villas / Flats
    expect(showcaseHeight(900, 1)).toBe(900);
    expect(showcaseHeight(900, 0)).toBe(900);
  });
});

describe("stages strip", () => {
  it("travels startX plus the overflow plus 110px", () => {
    // 7 × 292 + 6 × 96 = 2620 inside the 1268px column: 380 + 2620 − 1268 + 110.
    expect(stageTravel(2620, 1268)).toBe(1842);
    expect(defaultStageTravel(7)).toBe(1842);
    expect(stageTravel(900, 1268)).toBe(380);
  });

  it("makes the section vh + 1.25 × travel tall", () => {
    expect(stagesHeight(900, 1842)).toBe(3202.5);
    expect(stagesHeight(810, 1842)).toBe(3112.5);
  });

  it("translates the row from +380 to 380 − travel", () => {
    expect(stageOffset(0, 1842)).toBe(380);
    expect(stageOffset(0.25, 1842)).toBeCloseTo(-80.5, 6);
    expect(stageOffset(1, 1842)).toBe(-1462);
  });

  it("activates floor(p × n × 0.999) and keeps the last stage reachable", () => {
    expect([0, 0.25, 0.5, 0.75, 1].map((p) => activeStage(p, 7))).toEqual([0, 1, 3, 5, 6]);
    expect(activeStage(-0.1, 7)).toBe(0);
    expect(activeStage(1.2, 7)).toBe(6);
  });

  it("draws every stage up to one past the furthest reached", () => {
    expect([0, 1, 2, 3].map((i) => stageIsDrawn(i, 0))).toEqual([true, true, false, false]);
    expect([0, 1, 2, 3, 4, 5, 6].every((i) => stageIsDrawn(i, 6))).toBe(true);
  });
});
