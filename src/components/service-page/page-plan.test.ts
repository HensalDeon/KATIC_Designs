import { describe, expect, it } from "vitest";

import type { ServiceSection } from "@/content/service-pages";

import {
  contactSectionId,
  contactTone,
  planServicePage,
  sectionTone,
  withContactTarget,
} from "./page-plan";

const divisions = (tone?: "light" | "dark"): ServiceSection => ({
  type: "divisions",
  divisions: ["design"],
  ...(tone ? { tone } : {}),
});

describe("section tones (white/black alternate after the hero)", () => {
  it("starts white and alternates by index", () => {
    expect([0, 1, 2, 3, 4].map((index) => sectionTone({}, index))).toEqual([
      "light",
      "dark",
      "light",
      "dark",
      "light",
    ]);
  });

  it("lets a section override its own tone without shifting the others", () => {
    const plan = planServicePage({
      slug: "turnkey",
      sections: [divisions(), divisions("light"), divisions()],
    });
    expect(plan.sections.map((section) => section.tone)).toEqual(["light", "light", "light"]);
  });
});

describe("contact tone", () => {
  it("is the opposite of the section above it", () => {
    expect(contactTone("light")).toBe("dark");
    expect(contactTone("dark")).toBe("light");
  });

  it("is light right after the (dark) hero", () => {
    expect(contactTone(undefined)).toBe("light");
    expect(planServicePage({ slug: "factory", sections: [] }).contact.tone).toBe("light");
  });

  it("follows the last section, as on the original (interior light, turnkey dark)", () => {
    // Interior has 8 sections (last one black), turnkey 9 (last one white).
    const interior = planServicePage({
      slug: "interior",
      sections: Array.from({ length: 8 }, () => divisions()),
    });
    const turnkey = planServicePage({
      slug: "turnkey",
      sections: Array.from({ length: 9 }, () => divisions()),
    });
    expect([interior.sections.at(-1)?.tone, interior.contact.tone]).toEqual(["dark", "light"]);
    expect([turnkey.sections.at(-1)?.tone, turnkey.contact.tone]).toEqual(["light", "dark"]);
  });
});

describe("page plan", () => {
  it("keeps the order and gives every section a unique key", () => {
    const sections: ServiceSection[] = [
      divisions(),
      { type: "testimonials", testimonials: ["arch"] },
      divisions(),
    ];
    const plan = planServicePage({ slug: "interior", sections });
    expect(plan.sections.map(({ section }) => section)).toEqual(sections);
    expect(new Set(plan.sections.map(({ key }) => key)).size).toBe(sections.length);
  });

  it("names the contact section like the original (`<slug>-contact`)", () => {
    expect(contactSectionId("property-care")).toBe("property-care-contact");
    expect(planServicePage({ slug: "turnkey", sections: [] }).contact.id).toBe("turnkey-contact");
  });
});

describe("go-to-contact actions", () => {
  it("point at the page's own form without JavaScript", () => {
    expect(withContactTarget({ kind: "contact", label: "Go" }, "turnkey-contact")).toEqual({
      kind: "contact",
      label: "Go",
      href: "#turnkey-contact",
    });
  });

  it("keep an explicit target and leave other actions alone", () => {
    const explicit = { kind: "contact", label: "Go", href: "/#start" } as const;
    const link = { kind: "link", label: "Works", href: "/works" } as const;
    expect(withContactTarget(explicit, "x-contact")).toBe(explicit);
    expect(withContactTarget(link, "x-contact")).toBe(link);
  });
});
