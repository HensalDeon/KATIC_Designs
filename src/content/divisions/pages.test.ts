import { describe, expect, it } from "vitest";

import { planBlocks } from "@/components/blocks/block-plan";
import { isProjectSlug } from "@/content/projects";
import { SERVICE_FOR_PAGE } from "@/content/services";
import { DIVISION_SLUGS } from "@/lib/routes";

import { otherDivisions } from ".";
import { builtDivisionSlugs, DIVISION_PAGES, getDivisionPage } from "./pages";
import { divisionPageBlocks } from "./shared";

const pages = builtDivisionSlugs().map((slug) => {
  const page = getDivisionPage(slug);
  if (!page) throw new Error(`missing ${slug}`);
  return page;
});

describe("division page registry", () => {
  it("builds all five divisions, each under its own slug, in the site's order", () => {
    expect(builtDivisionSlugs()).toEqual([...DIVISION_SLUGS]);
    for (const page of pages) expect(DIVISION_PAGES[page.slug]).toBe(page);
  });

  it("returns nothing for unknown slugs", () => {
    expect(getDivisionPage("nope")).toBeUndefined();
    expect(getDivisionPage("constructor")).toBeUndefined();
  });
});

describe("otherDivisions", () => {
  it("lists the four others in order, never the division itself", () => {
    expect(otherDivisions("interior")).toEqual(["design", "infrastructure", "developers", "care"]);
    for (const slug of DIVISION_SLUGS) {
      expect(otherDivisions(slug)).toHaveLength(4);
      expect(otherDivisions(slug)).not.toContain(slug);
    }
  });
});

/** Block tones of the original (docs/analysis/04 §3), including the closing divisions grid. */
const ORIGINAL_TONES = {
  design: "LDLDLD",
  interior: "LDLDLDL",
  infrastructure: "LDLDLDL",
  developers: "LDLDLDLD",
  care: "LDLDLDL",
} as const;

describe.each(pages.map((page) => [page.slug, page] as const))("%s", (slug, page) => {
  const blocks = divisionPageBlocks(page);

  it("keeps the original's division title and a description", () => {
    expect(page.seo.title).toMatch(/^KATIC [A-Z][a-z]+ \| /);
    expect(page.seo.description.length).toBeGreaterThan(50);
  });

  it("starts a project with the division's PREFILL service (none for developers)", () => {
    const service = SERVICE_FOR_PAGE[`div-${slug}`];
    expect(page.hero.primaryCta).toEqual({
      kind: "enquiry",
      label: "Start a Project",
      ...(service ? { service } : {}),
    });
    if (slug === "developers") expect(service).toBeUndefined();
  });

  it("alternates tones exactly like the original", () => {
    const tones = planBlocks(blocks)
      .blocks.map(({ tone }) => (tone === "light" ? "L" : "D"))
      .join("");
    expect(tones).toBe(ORIGINAL_TONES[slug]);
  });

  it("ends with the other four divisions", () => {
    expect(blocks.at(-1)).toMatchObject({
      type: "divisionCards",
      columns: 4,
      divisions: otherDivisions(slug),
    });
  });

  it("references existing projects only", () => {
    for (const block of blocks) {
      if (block.type !== "projects") continue;
      for (const item of block.items) expect(isProjectSlug(item.project)).toBe(true);
    }
  });
});
