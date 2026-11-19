import { describe, expect, it } from "vitest";

import { HOME_PROCESS } from "@/content/home/process";
import { HOME_WORKS, projectCountLabel } from "@/content/home/works";
import { media } from "@/content/media";
import {
  getProject,
  getProjects,
  isProjectSlug,
  PROJECT_TYPE_CATEGORY,
  projectLocationLine,
  PROJECTS,
  projectsByCategory,
} from "@/content/projects";

/** Content behind the two pinned home sections (src/content/projects.ts, src/content/home/*). */

describe("projects (single source of truth, KI-D01)", () => {
  it("has unique slugs and existing cover images", () => {
    const slugs = PROJECTS.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const project of PROJECTS) expect(media[project.cover]).toBeDefined();
  });

  it("always files a project under the category its pill names (KI-D02)", () => {
    for (const project of PROJECTS) {
      expect(project.categories).toContain(PROJECT_TYPE_CATEGORY[project.type]);
    }
  });

  it("resolves slugs and rejects unknown ones", () => {
    expect(getProject("palm-veil-residence").name).toBe("Palm Veil Residence");
    expect(isProjectSlug("palm-veil-residence")).toBe(true);
    expect(isProjectSlug("nope")).toBe(false);
    expect(() => getProject("nope" as never)).toThrow(/Unknown project/);
  });

  it("prints the card line like the original", () => {
    expect(projectLocationLine(getProject("palm-veil-residence"))).toBe(
      "Thrissur, Kerala — Architecture",
    );
  });
});

describe("home Selected Works", () => {
  const showcase = getProjects(HOME_WORKS.projects);
  const titles = (category: Parameters<typeof projectsByCategory>[0]) =>
    projectsByCategory(category, showcase).map((project) => project.name);

  it("shows the original 11 projects in order", () => {
    expect(showcase.map((project) => project.name)).toEqual([
      "Obsidian Lounge",
      "Velvet Suite Penthouse",
      "Galičica Retreat",
      "Palm Veil Residence",
      "Cinder House",
      "Nila Apartments",
      "Serein Wellness Club",
      "House of Three Courts",
      "Al Quoz Atelier",
      "Greenfield School Campus",
      "DIFC Gallery Office",
    ]);
  });

  it("filters like the original tabs (measured), plus Serein under Commercial (KI-D02)", () => {
    expect(titles("all")).toHaveLength(11);
    expect(titles("residential")).toEqual([
      "Velvet Suite Penthouse",
      "Palm Veil Residence",
      "Cinder House",
      "Nila Apartments",
      "House of Three Courts",
    ]);
    expect(titles("commercial")).toEqual([
      "Obsidian Lounge",
      "Galičica Retreat",
      "Serein Wellness Club",
      "Al Quoz Atelier",
      "DIFC Gallery Office",
    ]);
    expect(titles("architecture")).toEqual([
      "Palm Veil Residence",
      "House of Three Courts",
      "Al Quoz Atelier",
      "Greenfield School Campus",
    ]);
    expect(titles("interiors")).toEqual([
      "Obsidian Lounge",
      "Velvet Suite Penthouse",
      "Cinder House",
      "Serein Wellness Club",
      "DIFC Gallery Office",
    ]);
    expect(titles("villas")).toEqual([
      "Velvet Suite Penthouse",
      "Palm Veil Residence",
      "Nila Apartments",
    ]);
  });

  it("labels the count", () => {
    expect(projectCountLabel(1)).toBe("1 project");
    expect(projectCountLabel(11)).toBe("11 projects");
  });
});

describe("home Seven stages", () => {
  it("has seven stages drawn 0 → 6", () => {
    expect(HOME_PROCESS.stages.map((stage) => stage.art)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
