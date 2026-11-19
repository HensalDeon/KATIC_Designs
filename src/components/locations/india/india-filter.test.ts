import { describe, expect, it } from "vitest";

import { indiaFilterHref, inIndiaFilter, parseIndiaArea } from "./india-filter";

describe("India project filter", () => {
  it.each([
    ["kochi", "kochi"],
    ["kerala", "kerala"],
    ["all", "all"],
    ["dubai", "all"],
    ["", "all"],
    [null, "all"],
  ] as const)("?area=%s shows %s", (value, filter) => {
    expect(parseIndiaArea(value)).toBe(filter);
  });

  it("links each state to the project grid", () => {
    expect(indiaFilterHref("all")).toBe("/locations/india#india-projects");
    expect(indiaFilterHref("kochi")).toBe("/locations/india?area=kochi#india-projects");
    expect(indiaFilterHref("kerala")).toBe("/locations/india?area=kerala#india-projects");
  });

  it("shows a card under its own area and under All", () => {
    expect(inIndiaFilter("kochi", "all")).toBe(true);
    expect(inIndiaFilter("kochi", "kochi")).toBe(true);
    expect(inIndiaFilter("kochi", "kerala")).toBe(false);
  });
});
