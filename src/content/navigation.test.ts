import { describe, expect, it } from "vitest";

import { activeNavKey } from "@/lib/routes/nav";

import { HEADER_NAV } from "./navigation";
import { serviceForPath } from "./services";

describe("activeNavKey", () => {
  it.each([
    ["/", "home"],
    ["/about", "about"],
    ["/services", "services"],
    ["/services/turnkey", "services"],
    ["/works", "projects"],
    ["/works/the-courtyard-house", "projects"],
    ["/divisions/care", "divisions"],
    ["/blog/designing-for-kerala-monsoon", "blogs"],
    ["/locations/dubai", "location"],
    ["/reviews", "reviews"],
    ["/news", undefined],
    ["/thank-you", undefined],
  ])("%s → %s", (pathname, key) => {
    expect(activeNavKey(pathname)).toBe(key);
  });
});

describe("HEADER_NAV", () => {
  it("has the original's eight items in order", () => {
    expect(HEADER_NAV.map((item) => item.label)).toEqual([
      "Home",
      "About",
      "Services",
      "Projects",
      "Divisions",
      "Reviews",
      "Blogs",
      "Location",
    ]);
  });
});

describe("serviceForPath", () => {
  it.each([
    ["/services/architecture", "Architectural Design"],
    ["/services/factory", "Interior Design"],
    ["/divisions/infrastructure", "Construction & Execution"],
    ["/divisions/developers", undefined],
    ["/about", undefined],
  ])("%s → %s", (pathname, service) => {
    expect(serviceForPath(pathname)).toBe(service);
  });
});
