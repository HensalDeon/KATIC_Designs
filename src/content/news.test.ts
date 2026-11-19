import { describe, expect, it } from "vitest";

import { media } from "./media";
import { formatNewsDate, latestNews, NEWS } from "./news";

describe("NEWS", () => {
  it("has the six items of the original news page with unique slugs and real media", () => {
    expect(NEWS).toHaveLength(6);
    expect(new Set(NEWS.map((item) => item.slug)).size).toBe(6);
    for (const item of NEWS) expect(media[item.image]).toBeDefined();
  });

  it("returns the newest items for the home teaser", () => {
    expect(latestNews(3).map((item) => item.title)).toEqual([
      "KATIC opens its Dubai design studio",
      "Courtyard House, Kochi handed over",
      "In-house joinery workshop expands",
    ]);
  });
});

describe("formatNewsDate", () => {
  it("matches the hand-written dates of the original markup", () => {
    expect(formatNewsDate("2026-10-28")).toBe("28 Oct 2026");
    expect(formatNewsDate("2026-09-30")).toBe("30 Sep 2026");
    expect(formatNewsDate("2026-08-05")).toBe("05 Aug 2026");
  });
});
