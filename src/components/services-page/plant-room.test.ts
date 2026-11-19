import { describe, expect, it } from "vitest";

import { plantRoom } from "./plant-room";

describe("plantRoom", () => {
  it("reserves 90% of the hanging heliconia's phone height, like the original (229.878 − 80)", () => {
    // pp_heli is 380×992 and 110px wide on the canvas: 63.8 × 992/380 → 166.53125 laid out.
    expect(plantRoom({ width: 380, height: 992 }, 110)).toBe(149.878);
  });

  it("scales with the plant's canvas width and aspect ratio", () => {
    expect(plantRoom({ width: 400, height: 400 }, 200)).toBe(104.4);
  });
});
