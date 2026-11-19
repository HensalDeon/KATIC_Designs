import { describe, expect, it } from "vitest";

import { builtProjectSlugs } from "./project-details";
import { getProjects, projectHref } from "./projects";
import {
  REVIEWS_CLIENTS,
  REVIEWS_EXPERTISE,
  REVIEWS_HERO,
  REVIEWS_PROJECTS,
  REVIEWS_STORY,
  REVIEWS_TRUST,
} from "./reviews";
import { testimonials } from "./testimonials";

describe("reviews content", () => {
  it("shows the shared pool's testimonials in the original's order", () => {
    expect(testimonials(REVIEWS_CLIENTS.testimonials).map((t) => t.meta)).toEqual([
      "Residential Project · Kochi",
      "Interior Renovation · Ernakulam",
      "Turnkey Residence · Thrissur",
      "Commercial Interior · Kozhikode",
      "New-Build Villa · Kottayam",
      "Design & Build Project · Alappuzha",
    ]);
  });

  it("references projects whose cards never lead to an unbuilt page (KI-F09)", () => {
    const built = new Set(builtProjectSlugs());
    const projects = getProjects(REVIEWS_PROJECTS.projects);
    expect(projects).toHaveLength(6);
    for (const project of projects) {
      expect(built.has(projectHref(project).replace(/^\/works\//, "")), project.slug).toBe(true);
    }
  });

  it("describes every image instead of repeating headlines or carrying ↗ (KI-A13)", () => {
    const alts = [
      REVIEWS_HERO.image.alt,
      REVIEWS_TRUST.image.alt,
      ...REVIEWS_EXPERTISE.cards.map((card) => card.image.alt),
      ...REVIEWS_STORY.images.map((image) => image.alt),
    ];
    for (const alt of alts) {
      expect(alt).not.toMatch(/↗|From brief to built|Built on trust|Banner photo/);
    }
    expect(new Set(REVIEWS_STORY.images.map((image) => image.alt)).size).toBe(4);
  });
});
