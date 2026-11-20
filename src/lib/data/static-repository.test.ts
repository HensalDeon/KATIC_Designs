import { describe, expect, it } from "vitest";
import type { z } from "zod";

import { media } from "@/content/media";
import { blockDefaultsSchema, contactTemplateSchema } from "@/lib/schemas/blocks";
import {
  divisionSchema,
  processStageSchema,
  projectSchema,
  relatedServiceSchema,
  sectorSchema,
  testimonialSchema,
} from "@/lib/schemas/entities";
import { mediaLibrarySchema } from "@/lib/schemas/media";
import { navigationSchema } from "@/lib/schemas/navigation";
import { newsItemSchema, newsPageSchema } from "@/lib/schemas/news";
import { blogPageSchema, postCategorySchema, postSchema } from "@/lib/schemas/posts";
import { servicePageSchema } from "@/lib/schemas/service-pages";
import { servicesPageSchema } from "@/lib/schemas/services-page";
import { siteSettingsSchema } from "@/lib/schemas/site";
import { thankYouPageSchema } from "@/lib/schemas/thank-you";

import { StaticRepository } from "./static-repository";

/**
 * Every static resource must parse with its schema AND come out unchanged: a schema that forgets a
 * field strips it silently, so equality (not just success) is what proves the schema describes the
 * content Laravel has to serve.
 */
const repo = new StaticRepository({ validate: false });

function expectSchema(schema: z.ZodType, value: unknown, label: string): void {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`${label}: ${z_issues(result.error)}`);
  expect(result.data, label).toEqual(value);
}

function z_issues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .slice(0, 5)
    .join("; ");
}

describe("static content matches the API schemas", () => {
  it("site settings and navigation", async () => {
    expectSchema(siteSettingsSchema, await repo.getSite(), "site");
    expectSchema(navigationSchema, await repo.getNavigation(), "navigation");
    expectSchema(contactTemplateSchema, await repo.getContactTemplate(), "contact");
    expectSchema(blockDefaultsSchema, await repo.getBlockDefaults(), "block defaults");
  });

  it("media library", async () => {
    const library = await repo.getMediaLibrary();
    expect(library.map((item) => item.id)).toEqual(Object.keys(media));
    // Vitest imports images as bare URLs (Next adds the size), so check the shape on a sample.
    expectSchema(
      mediaLibrarySchema,
      [{ id: "brand/logo", url: "/_next/static/media/logo.webp", width: 115, height: 65 }],
      "media",
    );
  });

  it("shared entities", async () => {
    for (const project of await repo.listProjects()) {
      expectSchema(projectSchema, project, `project ${project.slug}`);
    }
    for (const item of await repo.listTestimonials()) {
      expectSchema(testimonialSchema, item, `testimonial ${item.id}`);
    }
    for (const stage of await repo.listProcessStages()) {
      expectSchema(processStageSchema, stage, `stage ${stage.id}`);
    }
    for (const sector of await repo.listSectors()) {
      expectSchema(sectorSchema, sector, `sector ${sector.key}`);
    }
    for (const division of await repo.listDivisions()) {
      expectSchema(divisionSchema, division, `division ${division.slug}`);
    }
    for (const service of await repo.listRelatedServices()) {
      expectSchema(relatedServiceSchema, service, `related service ${service.slug}`);
    }
  });

  it("service pages", async () => {
    const slugs = await repo.listServicePageSlugs();
    expect(slugs.length).toBe(8);
    for (const slug of slugs) {
      expectSchema(servicePageSchema, await repo.getServicePage(slug), `service ${slug}`);
    }
  });

  it("blog and news", async () => {
    const categories = await repo.listPostCategories();
    expect(categories).toHaveLength(9);
    for (const category of categories) {
      expectSchema(postCategorySchema, category, `post category ${category.slug}`);
    }
    const posts = await repo.listPosts();
    expect(posts).toHaveLength(9);
    for (const post of posts) expectSchema(postSchema, post, `post ${post.slug}`);
    expectSchema(postSchema, await repo.getPost("choosing-natural-stone"), "post by slug");
    expectSchema(blogPageSchema, await repo.getBlogPage(), "blog page");
    const news = await repo.listNews();
    expect(news).toHaveLength(6);
    for (const item of news) expectSchema(newsItemSchema, item, `news ${item.slug}`);
    expectSchema(newsPageSchema, await repo.getNewsPage(), "news page");
  });

  it("services overview and thank-you pages", async () => {
    expectSchema(servicesPageSchema, await repo.getServicesPage(), "services page");
    expectSchema(thankYouPageSchema, await repo.getThankYouPage(), "thank-you page");
  });
});

describe("page schemas", () => {
  it("reject a copy template without its placeholder", async () => {
    const { page, article } = await repo.getBlogPage();
    const broken = { page: { ...page, categoryHeading: "Articles" }, article };
    expect(blogPageSchema.safeParse(broken).success).toBe(false);
    const extra = { page, article: { ...article, seoTitle: "{title} — {brand}" } };
    expect(blogPageSchema.safeParse(extra).success).toBe(false);
  });

  it("reject a services block whose service has no card", async () => {
    const page = await repo.getServicesPage();
    const [first, ...rest] = page.blocks;
    const broken = { ...page, blocks: [{ ...first, slug: "factory" }, ...rest] };
    expect(servicesPageSchema.safeParse(broken).success).toBe(false);
  });
});

describe("StaticRepository", () => {
  it("answers undefined for unknown slugs (the routes' 404)", async () => {
    await expect(repo.getServicePage("nope")).resolves.toBeUndefined();
    await expect(repo.getDivisionPage("nope")).resolves.toBeUndefined();
    await expect(repo.getProjectPage("nope")).resolves.toBeUndefined();
    await expect(repo.getProject("nope")).resolves.toBeUndefined();
    await expect(repo.getPost("nope")).resolves.toBeUndefined();
  });

  it("filters projects and posts", async () => {
    const villas = await repo.listProjects({ category: "villas" });
    expect(villas.length).toBeGreaterThan(0);
    expect(villas.every((project) => project.categories.includes("villas"))).toBe(true);
    const posts = await repo.listPosts({ category: "architecture" });
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((post) => post.category === "Architecture")).toBe(true);
  });

  it("validates on the way out when asked to", async () => {
    const validating = new StaticRepository({ validate: true });
    await expect(validating.getServicePage("architecture")).resolves.toBeDefined();
  });

  it("serves only serialisable data (cacheable with `use cache`)", async () => {
    const pages = await Promise.all([
      repo.getHomePage(),
      repo.getAboutPage(),
      repo.getServicesPage(),
      repo.getWorksPage(),
      repo.getReviewsPage(),
      repo.getThankYouPage(),
      repo.getNewsPage(),
      repo.getBlogPage(),
      repo.getIndiaPage(),
      repo.getDubaiPage(),
    ]);
    for (const page of pages) expect(structuredClone(page)).toEqual(page);
  });
});
