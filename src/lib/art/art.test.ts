import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import original from "../../../tests/fixtures/art/original-art.json";
import {
  type ArtDrawing,
  ICON_NAMES,
  iconArt,
  type IconName,
  isIconName,
  pickIcon,
  pickIcons,
  pickStage,
  pickStages,
  stageArt,
  toStageIndex,
} from "./index";

/*
 * The fixture is generated from the ORIGINAL site's scripts (scripts/art/export-original-art.mts).
 * Re-serialising the port with the original's exact templates and comparing hashes proves the
 * drawings are byte-identical, not just structurally equal.
 */

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Original `KATIC_ART` svg() template. */
function originalStageMarkup(a: ArtDrawing): string {
  let s = `<svg viewBox="${a.viewBox}" preserveAspectRatio="${a.preserveAspectRatio}"><defs><linearGradient id="kg" gradientUnits="userSpaceOnUse" x1="40" y1="20" x2="230" y2="250"><stop offset="0" stop-color="#ffd3b4"/><stop offset=".5" stop-color="#E8622C"/><stop offset="1" stop-color="#8a3414"/></linearGradient></defs>`;
  s += `<ellipse class="sh" cx="130" cy="160" rx="110" ry="40"/>`;
  for (const q of a.lit) s += `<polygon class="lit" points="${q}"/>`;
  for (const p of a.paths)
    s += `<path class="ln${p.dashed ? " dsh" : ""}" pathLength="1" d="${p.d}"/>`;
  return s + "</svg>";
}

/** Original `KATIC_ICON.draw()` template. */
function originalIconMarkup(a: ArtDrawing): string {
  let s = `<svg viewBox="${a.viewBox}" preserveAspectRatio="${a.preserveAspectRatio}" aria-hidden="true">`;
  for (const p of a.paths)
    s += `<path class="ln${p.dashed ? " dsh" : ""}" pathLength="1" d="${p.d}"/>`;
  return s + "</svg>";
}

const spec = ({ viewBox, preserveAspectRatio, lit, paths }: ArtDrawing) => ({
  viewBox,
  preserveAspectRatio,
  lit,
  paths,
});

describe("stage drawings (KATIC_ART)", () => {
  it("has the original's seven stages", () => {
    expect(original.stages).toHaveLength(7);
  });

  original.stages.forEach(({ sha256: hash, ...expected }, i) => {
    it(`stage ${i} matches the original byte for byte`, () => {
      const art = stageArt(i);
      expect(spec(art)).toEqual(expected);
      expect(sha256(originalStageMarkup(art))).toBe(hash);
    });
  });

  it("clamps out-of-range indices like KATIC_ART(i)", () => {
    expect(stageArt(-3)).toEqual(stageArt(0));
    expect(stageArt(42)).toEqual(stageArt(6));
    expect(toStageIndex(Number.NaN)).toBe(0);
  });
});

describe("feature icons (KATIC_ICON)", () => {
  it("has the same icons, in the same order", () => {
    expect(ICON_NAMES).toEqual(original.iconNames);
  });

  for (const name of original.iconNames) {
    it(`${name} matches the original byte for byte`, () => {
      if (!isIconName(name)) throw new Error(`Unknown icon ${name}`);
      const { sha256: hash, ...expected } = original.icons[name];
      const art = iconArt(name);
      expect(spec(art)).toEqual(expected);
      expect(sha256(originalIconMarkup(art))).toBe(hash);
    });
  }
});

describe("pickIcon", () => {
  it.each(original.featureGrids.map((g) => [g.page, g.titles, g.icons] as const))(
    "reproduces the original grid on %s",
    (_page, titles, icons) => {
      expect(pickIcons(titles)).toEqual(icons);
    },
  );

  it("maps a lone 'Kitchens' to the counter before any rule", () => {
    expect(pickIcon("Kitchens", new Set())).toBe("counter");
    expect(pickIcon("Kitchen & bath", new Set())).toBe("bath");
  });

  it("decodes &amp; so HTML and plain titles agree", () => {
    expect(pickIcon("Structural &amp; civil works", new Set())).toBe(
      pickIcon("Structural & civil works", new Set()),
    );
  });

  it("keeps icons unique within a grid and falls back in order", () => {
    const used = new Set<IconName>();
    expect(pickIcon("Residential", used)).toBe("house");
    expect(pickIcon("Residential", used)).toBe("layers");
    expect(pickIcon("Something else", used)).toBe("network");
    expect([...used]).toEqual(["house", "layers", "network"]);
  });
});

describe("pickStage", () => {
  it.each(original.stepGrids.map((g) => [g.page, g.titles, g.stages] as const))(
    "reproduces the original row on %s",
    (_page, titles, stages) => {
      expect(pickStages(titles)).toEqual(stages);
    },
  );

  it("ignores a keyword more than two stages from the step's position", () => {
    // "Handover" (6) as the first of five steps is too far from 0.
    expect(pickStage("Handover", 0, 5)).toBe(0);
    expect(pickStage("Handover", 4, 5)).toBe(6);
    expect(pickStage("Anything", 0, 1)).toBe(0);
  });
});
