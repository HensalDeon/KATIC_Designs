import { describe, expect, it } from "vitest";

import { ABOUT_APPROACH, ABOUT_DIVISIONS, ABOUT_SEO, ABOUT_SERVICES, ABOUT_WORKS } from "./about";
import { getProject, isProjectSlug } from "./projects";

/** About page content (src/content/about.ts) against the original `#p-about`. */
describe("about content", () => {
  it("keeps the original title and description", () => {
    expect(ABOUT_SEO.title).toBe(
      "About Katic Designs | Architecture & Interior Design Studio, Kochi",
    );
    expect(ABOUT_SEO.description).toMatch(/^Founded in 2013 in Kochi/);
  });

  it("references the works mosaic projects from the shared project list (KI-D01)", () => {
    expect(ABOUT_WORKS.tiles.map((tile) => tile.layout)).toEqual(["big", "tall", "small", "small"]);
    for (const tile of ABOUT_WORKS.tiles) expect(isProjectSlug(tile.project)).toBe(true);
    expect(
      ABOUT_WORKS.tiles.map(({ project }) => {
        const { name, scope, location } = getProject(project);
        return `${name} · ${scope} · ${location}`;
      }),
    ).toEqual([
      "Obsidian Lounge · Residential Interior · Kochi, Kerala",
      "Villa Noor · Turnkey Residence · Abu Dhabi, UAE",
      "The Courtyard House · Architecture · Thrissur, Kerala",
      "Canvas Kitchen · Interior Design · Dubai, UAE",
    ]);
  });

  it("lists seven services, five divisions and five approach stages in the original order", () => {
    expect(ABOUT_SERVICES.items).toHaveLength(7);
    expect(ABOUT_SERVICES.items.indexOf("exterior")).toBe(5);
    expect(ABOUT_DIVISIONS.items).toEqual([
      "design",
      "interior",
      "infrastructure",
      "developers",
      "care",
    ]);
    expect(ABOUT_APPROACH.steps.map((step) => step.title)).toEqual([
      "Understand",
      "Plan",
      "Design",
      "Execute",
      "Support",
    ]);
  });
});
