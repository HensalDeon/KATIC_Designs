import { describe, expect, it } from "vitest";

import { resolveLegacyHash } from "./legacy";

/** Legacy hash → new URL table (docs/analysis/04 §13 plus the service and home routes). */
describe("resolveLegacyHash", () => {
  it.each([
    // home and contact
    ["#home", "/"],
    ["#home/home-process", "/#home-process"],
    ["#home/contact-sec", "/#start"],
    ["#contact", "/#start"],
    // about and services
    ["#about", "/about"],
    ["#about/about-divisions", "/about#about-divisions"],
    ["#services", "/services"],
    ["#architecture", "/services/architecture"],
    ["#architecture/process", "/services/architecture#process"],
    ["#factory", "/services/factory"],
    ["#property-care/pc-services", "/services/property-care#pc-services"],
    ["#renovation/ba", "/services/renovation#ba"],
    // works and projects
    ["#works", "/works"],
    ["#works/works-list", "/works#works-list"],
    ["#works/works-list/all", "/works#works-list"],
    ["#works/works-list/residential", "/works?category=residential#works-list"],
    ["#works/works-list/villas", "/works?category=villas#works-list"],
    ["#works/works-list/unknown", "/works#works-list"],
    ["#project", "/works/the-courtyard-house"],
    ["#project/project-gallery", "/works/the-courtyard-house#project-gallery"],
    // divisions
    ["#div-design", "/divisions/design"],
    ["#div-care", "/divisions/care"],
    // content
    ["#news", "/news"],
    ["#blog", "/blog"],
    ["#blog/blog-list/all", "/blog"],
    ["#blog/blog-list/interior-design", "/blog/category/interior-design"],
    ["#article/designing-for-kerala-monsoon", "/blog/designing-for-kerala-monsoon"],
    ["#article", "/blog"],
    // locations
    ["#india", "/locations/india"],
    ["#kochi", "/locations/india"],
    ["#india/india-projects/kerala", "/locations/india?area=kerala#india-projects"],
    ["#dubai", "/locations/dubai"],
    ["#dubai/dubai-context", "/locations/dubai#dubai-context"],
    // misc
    ["#reviews", "/reviews"],
    ["#thank-you", "/thank-you"],
  ])("%s → %s", (hash, path) => {
    expect(resolveLegacyHash(hash)).toBe(path);
  });

  it.each(["", "#", "#start", "#main", "#div-unknown", "#about-divisions"])(
    "leaves non-legacy hash %j alone",
    (hash) => {
      expect(resolveLegacyHash(hash)).toBeNull();
    },
  );
});
