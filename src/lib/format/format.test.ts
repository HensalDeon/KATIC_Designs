import { describe, expect, it } from "vitest";

import { formatNewsDate, formatPostDate } from "./dates";
import { fillTemplate, templatePlaceholders } from "./template";

describe("dates", () => {
  it("formats blog dates like the original's en-GB toLocaleDateString", () => {
    expect(formatPostDate("2026-10-14")).toBe("14 Oct 2026");
    expect(formatPostDate("2026-10-02")).toBe("2 Oct 2026");
    expect(formatPostDate("2026-09-18")).toBe("18 Sept 2026");
  });

  it("formats news dates with two-digit days and three-letter months", () => {
    expect(formatNewsDate("2026-08-05")).toBe("05 Aug 2026");
    expect(formatNewsDate("2026-09-30")).toBe("30 Sep 2026");
  });
});

describe("templates", () => {
  it("fills every placeholder", () => {
    expect(fillTemplate("{category} articles", { category: "Construction" })).toBe(
      "Construction articles",
    );
    expect(templatePlaceholders("{title} — {brand}")).toEqual(["title", "brand"]);
  });

  it("refuses a placeholder without a value", () => {
    expect(() => fillTemplate("{title} — Katic Designs", {})).toThrow(/\{title\}/);
  });
});
