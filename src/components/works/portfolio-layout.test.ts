import { describe, expect, it } from "vitest";

import { getProjects, projectsByCategory } from "@/content/projects";
import { WORKS_PORTFOLIO } from "@/content/works";
import { WORKS_CATEGORIES } from "@/lib/routes";

import {
  cardMetaParts,
  parseWorksCategory,
  portfolioSlots,
  resultCountLabel,
  slotSize,
  worksFilterHref,
} from "./portfolio-layout";

describe("parseWorksCategory", () => {
  it("accepts every works category", () => {
    for (const category of WORKS_CATEGORIES) expect(parseWorksCategory(category)).toBe(category);
  });

  it("falls back to all for missing, empty or unknown values", () => {
    for (const value of [null, undefined, "", "all", "Residential", "villas ", "foo"]) {
      expect(parseWorksCategory(value)).toBe("all");
    }
  });
});

describe("worksFilterHref", () => {
  it("is shareable and lands on the portfolio", () => {
    expect(worksFilterHref("all")).toBe("/works#works-list");
    expect(worksFilterHref("interiors")).toBe("/works?category=interiors#works-list");
  });
});

describe("portfolioSlots", () => {
  it("reproduces the original layout for all 8 projects", () => {
    const slots = portfolioSlots(8);
    expect(slots.map((slot) => slot.pattern)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
    expect(slots.map((slot) => slotSize(slot))).toEqual([
      { width: 790, height: 570 },
      { width: 472, height: 570 },
      { width: 472, height: 430 },
      { width: 790, height: 560 },
      { width: 632, height: 509 },
      { width: 630, height: 509 },
      { width: 472, height: 470 },
      { width: 790, height: 570 },
    ]);
  });

  it("fills rows left to right with no empty cell before the last card", () => {
    for (let count = 0; count <= 12; count += 1) {
      const slots = portfolioSlots(count);
      expect(slots).toHaveLength(count);
      slots.forEach((slot, index) => {
        expect(slot.row).toBe(Math.floor(index / 2));
        if (index % 2 === 1) expect(slot.side).toBe("right");
        else expect(slot.side).toBe(index === count - 1 ? "single" : "left");
      });
      // Every row but the last has exactly two cards, and each pair spans the full 1296px row.
      for (let row = 0; row < Math.floor(count / 2); row += 1) {
        const [left, right] = slots.filter((slot) => slot.row === row);
        if (!left || !right) throw new Error("row is not full");
        expect(slotSize(left).width + 34 + slotSize(right).width).toBe(1296);
      }
    }
  });

  it("gives a card left alone on the last row the wide column", () => {
    expect(portfolioSlots(1)).toEqual([{ row: 0, pattern: 0, side: "single" }]);
    const last = portfolioSlots(3).at(-1);
    expect(last).toEqual({ row: 1, pattern: 1, side: "single" });
    if (last) expect(slotSize(last)).toEqual({ width: 790, height: 570 });
  });
});

describe("filtered results", () => {
  const projects = getProjects(WORKS_PORTFOLIO.projects);

  it("every filter tab is a works category or all", () => {
    expect(WORKS_PORTFOLIO.filters.map((filter) => filter.category)).toEqual([
      "all",
      ...WORKS_CATEGORIES,
    ]);
  });

  it("each tab shows at least one project and never leaves an empty row", () => {
    for (const { category } of WORKS_PORTFOLIO.filters) {
      const visible = projectsByCategory(category, projects);
      expect(visible.length).toBeGreaterThan(0);
      const rows = new Set(portfolioSlots(visible.length).map((slot) => slot.row));
      expect(rows.size).toBe(Math.ceil(visible.length / 2));
    }
  });
});

describe("cardMetaParts", () => {
  it("prints location, type and scope from the project entity", () => {
    const [palm, , , serein, , alQuoz, greenfield, difc] = getProjects(WORKS_PORTFOLIO.projects);
    if (!palm || !serein || !alQuoz || !greenfield || !difc) throw new Error("missing project");
    expect(cardMetaParts(palm)).toEqual(["Thrissur, Kerala", "Villa", "Architecture"]);
    expect(cardMetaParts(serein)).toEqual(["Abu Dhabi, UAE", "Commercial", "Interior Design"]);
    expect(cardMetaParts(alQuoz)).toEqual(["Dubai, UAE", "Commercial", "Architecture + Build"]);
    // The original's cards 7–8 typed these with a plain " / " (KI-D06).
    expect(cardMetaParts(greenfield)).toEqual([
      "Kottayam, Kerala",
      "Institutional",
      "Architecture",
    ]);
    expect(cardMetaParts(difc)).toEqual(["DIFC, Dubai", "Commercial", "Interiors"]);
  });
});

describe("resultCountLabel", () => {
  it("pluralises", () => {
    expect(resultCountLabel(1)).toBe("1 project");
    expect(resultCountLabel(3)).toBe("3 projects");
  });
});
