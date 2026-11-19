import { describe, expect, it } from "vitest";

import { media } from "./media";
import {
  articleSeo,
  blogCategorySeo,
  formatPostDate,
  getPost,
  getPostCategory,
  latestPosts,
  otherLatestPosts,
  POST_CATEGORIES,
  postCategorySlug,
  POSTS,
  postsByCategory,
} from "./posts";

describe("POSTS", () => {
  it("has the original's nine posts, one per category, with unique slugs", () => {
    expect(POSTS).toHaveLength(9);
    expect(new Set(POSTS.map((post) => post.slug)).size).toBe(9);
    expect(POSTS.map((post) => post.category)).toEqual(POST_CATEGORIES.map((c) => c.name));
  });

  it("references existing media for covers and inline images", () => {
    for (const post of POSTS) {
      expect(media[post.cover]).toBeDefined();
      for (const block of post.body) {
        if (block.type === "img") expect(media[block.image]).toBeDefined();
      }
    }
  });

  it("keeps the original body block counts (30 p, 19 h, 3 ul, 3 img)", () => {
    const counts = { p: 0, h: 0, ul: 0, img: 0 };
    for (const post of POSTS) for (const block of post.body) counts[block.type] += 1;
    expect(counts).toEqual({ p: 30, h: 19, ul: 3, img: 3 });
  });
});

describe("category slugs", () => {
  it.each([
    ["Architecture", "architecture"],
    ["Interior Design", "interior-design"],
    ["Materials & Finishes", "materials-finishes"],
    ["Renovation & Remodeling", "renovation-remodeling"],
    ["Real Estate & Development", "real-estate-development"],
  ] as const)("%s → %s", (name, slug) => {
    expect(postCategorySlug(name)).toBe(slug);
    expect(getPostCategory(slug)?.name).toBe(name);
  });

  it("returns undefined for unknown slugs", () => {
    expect(getPostCategory("nope")).toBeUndefined();
  });
});

describe("lookups", () => {
  it("finds posts by slug and returns undefined otherwise (no silent fallback)", () => {
    expect(getPost("choosing-natural-stone")?.title).toBe(
      "Choosing Natural Stone for Kerala Homes",
    );
    expect(getPost("missing")).toBeUndefined();
  });

  it("sorts newest first", () => {
    expect(latestPosts(4).map((post) => post.slug)).toEqual([
      "designing-for-kerala-monsoon",
      "planning-an-interior-that-lasts",
      "choosing-natural-stone",
      "construction-quality-checklist",
    ]);
  });

  it("filters by category slug, or returns all", () => {
    expect(postsByCategory("property-care").map((post) => post.slug)).toEqual([
      "pre-monsoon-maintenance",
    ]);
    expect(postsByCategory("all")).toHaveLength(9);
  });
});

describe("formatPostDate", () => {
  it("formats like the original's en-GB toLocaleDateString", () => {
    expect(formatPostDate("2026-10-14")).toBe("14 Oct 2026");
    expect(formatPostDate("2026-10-02")).toBe("2 Oct 2026");
    expect(formatPostDate("2026-09-18")).toBe("18 Sept 2026");
  });
});

describe("article and category pages", () => {
  it("lists the four newest other posts in an article's aside", () => {
    expect(otherLatestPosts("planning-an-interior-that-lasts", 4).map((post) => post.slug)).toEqual(
      [
        "designing-for-kerala-monsoon",
        "choosing-natural-stone",
        "construction-quality-checklist",
        "what-turnkey-really-means",
      ],
    );
  });

  it("titles an article as the original leaves it at runtime", () => {
    const post = getPost("choosing-natural-stone");
    if (!post) throw new Error("missing post");
    expect(articleSeo(post)).toEqual({
      title: "Choosing Natural Stone for Kerala Homes — Katic Designs",
      description: post.excerpt,
    });
  });

  it("titles a category page after its category", () => {
    const category = getPostCategory("property-care");
    if (!category) throw new Error("missing category");
    expect(blogCategorySeo(category).title).toBe("Property Care Articles | Katic Designs Blog");
  });
});
