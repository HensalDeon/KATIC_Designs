import { describe, expect, it } from "vitest";

import { planServicePage } from "@/components/service-page/page-plan";
import { isProjectSlug } from "@/content/projects";
import { SERVICE_FOR_PAGE } from "@/content/services";
import { SERVICE_SLUGS } from "@/lib/routes";

import { builtServiceSlugs, getServicePage, SERVICE_PAGES } from ".";

const pages = builtServiceSlugs().map((slug) => {
  const page = getServicePage(slug);
  if (!page) throw new Error(`missing ${slug}`);
  return page;
});

describe("service page registry", () => {
  it("has a key for every service slug and files each page under its own slug", () => {
    expect(Object.keys(SERVICE_PAGES).sort()).toEqual([...SERVICE_SLUGS].sort());
    for (const page of pages) expect(SERVICE_PAGES[page.slug]).toBe(page);
  });

  it("lists the built pages in the site's service order", () => {
    expect(builtServiceSlugs()).toEqual(["interior", "turnkey"]);
  });

  it("returns nothing for unknown or unbuilt slugs", () => {
    expect(getServicePage("nope")).toBeUndefined();
    expect(getServicePage("architecture")).toBeUndefined();
    expect(getServicePage("constructor")).toBeUndefined();
  });
});

describe.each(pages.map((page) => [page.slug, page] as const))("%s content", (slug, page) => {
  const service = SERVICE_FOR_PAGE[slug];

  it("keeps the original's title brand and a description", () => {
    expect(page.seo.title).toMatch(/\| Katic (Designs|Care)$/);
    expect(page.seo.description.length).toBeGreaterThan(50);
  });

  it("preselects the page's service from the hero and in the form", () => {
    expect(page.hero.primaryCta).toMatchObject({ kind: "contact", service });
    expect(page.contact.form.service).toEqual({ mode: "select", defaultService: service });
  });

  it("has unique section ids that never collide with the contact id", () => {
    const ids = page.sections.flatMap((section) => (section.id ? [section.id] : []));
    ids.push(planServicePage(page).contact.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references existing projects only", () => {
    for (const section of page.sections) {
      if (section.type !== "projects") continue;
      for (const item of section.items) expect(isProjectSlug(item.project)).toBe(true);
    }
  });

  it("links FAQ anchors to sections on the page", () => {
    const ids = new Set(page.sections.flatMap((section) => (section.id ? [section.id] : [])));
    for (const item of page.contact.faq.items) {
      if (item.link && "href" in item.link && item.link.href.startsWith("#")) {
        expect(ids.has(item.link.href.slice(1))).toBe(true);
      }
    }
  });
});
