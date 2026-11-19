import { runInNewContext } from "node:vm";

import { describe, expect, it } from "vitest";

import { computeSvh, computeZoom, ZOOM_BOOTSTRAP_SCRIPT } from "./zoom";

describe("computeZoom", () => {
  it.each([
    [390, 1],
    [1099, 1],
    [1100, 0.7639],
    [1280, 0.8889],
    [1440, 1],
    [1920, 1.3333],
    [2560, 1.7778],
  ])("clientWidth %i → %f", (width, expected) => {
    expect(computeZoom(width)).toBe(expected);
  });
});

describe("computeSvh", () => {
  it("expresses the viewport height in canvas px", () => {
    expect(computeSvh(900, 1)).toBe(900);
    expect(computeSvh(1080, 1.3333)).toBe(810);
    expect(computeSvh(650, 0.9486)).toBe(685.2);
  });
});

describe("ZOOM_BOOTSTRAP_SCRIPT", () => {
  function run(clientWidth: number, innerHeight: number) {
    const vars = new Map<string, string>();
    const listeners: string[] = [];
    const classes: string[] = [];
    runInNewContext(ZOOM_BOOTSTRAP_SCRIPT, {
      document: {
        documentElement: {
          clientWidth,
          classList: { add: (name: string) => classes.push(name) },
          style: { setProperty: (name: string, value: string) => vars.set(name, value) },
        },
      },
      innerHeight,
      addEventListener: (type: string) => listeners.push(type),
      window: {},
    });
    return { vars, listeners, classes };
  }

  it.each([
    [1920, 1080],
    [1366, 650],
    [1024, 768],
    [390, 844],
  ])("matches computeZoom/computeSvh at %ix%i", (width, height) => {
    const { vars } = run(width, height);
    const z = computeZoom(width);
    expect(vars.get("--z")).toBe(String(z));
    expect(vars.get("--svh")).toBe(`${computeSvh(height, z).toFixed(1)}px`);
  });

  it("marks the document as scripted", () => {
    expect(run(1440, 900).classes).toEqual(["js"]);
  });

  it("keeps the values in sync on resize", () => {
    expect(run(1440, 900).listeners).toEqual(["resize"]);
  });
});
