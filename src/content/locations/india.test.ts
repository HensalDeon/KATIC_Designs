import { describe, expect, it } from "vitest";

import { getProject } from "@/content/projects";
import type { IndiaBlock, IndiaProjectsBlock } from "@/lib/schemas/locations";

import { INDIA_PAGE } from "./india";

const blocks: readonly IndiaBlock[] = INDIA_PAGE.blocks;
const projects = blocks.find(
  (block): block is IndiaProjectsBlock => block.type === "indiaProjects",
);

describe("India page content", () => {
  it("has the original's nine sections: hero, seven blocks, contact", () => {
    expect(INDIA_PAGE.blocks.map((block) => block.type)).toEqual([
      "split",
      "cards",
      "related",
      "divisionCards",
      "indiaProjects",
      "features",
      "process",
    ]);
    expect(INDIA_PAGE.contact.id).toBe("india-contact");
  });

  it("groups each project by where it is (the original's data-cat)", () => {
    expect(projects?.items).toHaveLength(6);
    for (const { project: slug, area } of projects?.items ?? []) {
      const project = getProject(slug);
      expect(project.region).toBe("kerala");
      // Kochi cards are in Kochi; "Rest of Kerala" cards are elsewhere in Kerala.
      expect(project.location.endsWith(", Kochi"), slug).toBe(area === "kochi");
    }
  });

  it("prints each card's location as the project's own", () => {
    for (const { project: slug, meta } of projects?.items ?? []) {
      expect(meta.endsWith(getProject(slug).location), slug).toBe(true);
    }
  });
});
