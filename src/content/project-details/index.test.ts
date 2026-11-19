import { describe, expect, it } from "vitest";

import { media } from "@/content/media";
import { getProject, isProjectSlug } from "@/content/projects";

import { builtProjectSlugs, getProjectDetail, hasProjectDetail } from ".";

const details = builtProjectSlugs().map((slug) => {
  const detail = getProjectDetail(slug);
  if (!detail) throw new Error(`missing ${slug}`);
  return detail;
});

describe("project detail registry", () => {
  it("lists The Courtyard House, filed under its own slug", () => {
    expect(builtProjectSlugs()).toEqual(["the-courtyard-house"]);
    for (const detail of details) expect(getProjectDetail(detail.slug)).toBe(detail);
  });

  it("returns nothing for unknown slugs and projects without a page", () => {
    expect(getProjectDetail("nope")).toBeUndefined();
    expect(getProjectDetail("constructor")).toBeUndefined();
    expect(getProjectDetail("canopy-house")).toBeUndefined();
    expect(hasProjectDetail("canopy-house")).toBe(false);
    expect(hasProjectDetail("the-courtyard-house")).toBe(true);
  });
});

describe.each(details.map((detail) => [detail.slug, detail] as const))("%s", (slug, detail) => {
  it("describes an existing project and spells its name in the banner", () => {
    expect(isProjectSlug(slug)).toBe(true);
    const { lines, accent } = detail.hero.title;
    expect([...lines, accent].join(" ")).toBe(getProject(detail.slug).name);
  });

  it("keeps the original's title brand and a description", () => {
    expect(detail.seo.title).toMatch(/\| Project by Katic Designs$/);
    expect(detail.seo.description.length).toBeGreaterThan(50);
  });

  it("has a ten-photo gallery, every photo captioned, rows filled to their layout", () => {
    const photos = detail.gallery.rows.flatMap((row) => row.photos);
    expect(photos).toHaveLength(10);
    for (const photo of photos) expect(photo.caption.length).toBeGreaterThan(10);
    const columns = { full: 1, "wide-narrow": 2, "narrow-wide": 2, thirds: 3 } as const;
    for (const row of detail.gallery.rows) expect(row.photos).toHaveLength(columns[row.layout]);
    expect(detail.gallery.viewsLabel).toMatch(/^10 VIEWS/);
  });

  it("uses known images with descriptive alts, never the section headline (KI-A13)", () => {
    const images = [
      detail.hero.image,
      ...detail.overview.images,
      detail.designResponse.mainImage,
      detail.designResponse.planning.image,
      ...detail.brief.images.map((photo) => photo.image),
      ...detail.materials.images.map((photo) => photo.image),
      ...detail.gallery.rows.flatMap((row) => row.photos.map((photo) => photo.image)),
      detail.cta.image,
    ];
    const headlines = [detail.overview, detail.brief, detail.materials].map((section) =>
      section.title.join(" "),
    );
    for (const { src, alt } of images) {
      if (typeof src === "string") expect(media[src], src).toBeDefined();
      expect(alt.length).toBeGreaterThan(5);
      expect(headlines).not.toContain(alt);
    }
  });

  it("relates other existing projects, each once", () => {
    const slugs = detail.related.projects.map((card) => card.project);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).not.toContain(detail.slug);
    for (const card of detail.related.projects) {
      expect(isProjectSlug(card.project)).toBe(true);
      expect(card.meta).toMatch(/^[A-Z +]+ · [A-Z]+$/);
    }
  });
});
