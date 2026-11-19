import { describe, expect, it } from "vitest";

import { builtProjectSlugs } from "./project-details";
import { FALLBACK_PROJECT_SLUG, getProject, projectHref, PROJECTS } from "./projects";

describe("projectHref (link policy, KI-F09)", () => {
  const built = new Set(builtProjectSlugs());

  it("falls back to a project that has its own page", () => {
    expect(built.has(FALLBACK_PROJECT_SLUG)).toBe(true);
  });

  it("links a project with a built page to its own /works/<slug>", () => {
    expect(projectHref(getProject("the-courtyard-house"))).toBe("/works/the-courtyard-house");
  });

  it("links every other project to The Courtyard House, as the original does", () => {
    expect(projectHref(getProject("canopy-house"))).toBe("/works/the-courtyard-house");
    expect(projectHref(getProject("obsidian-lounge"))).toBe("/works/the-courtyard-house");
  });

  it("never links a card to a page that is not built", () => {
    for (const project of PROJECTS) {
      const slug = projectHref(project).replace(/^\/works\//, "");
      expect(built.has(slug), project.slug).toBe(true);
    }
  });
});

describe("projects", () => {
  it("have unique slugs", () => {
    const slugs = PROJECTS.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
