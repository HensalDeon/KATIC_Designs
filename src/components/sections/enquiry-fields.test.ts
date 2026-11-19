import { describe, expect, it } from "vitest";

import { leadSchema } from "@/lib/leads/schema";

import {
  collectExtra,
  type EnquirySelectField,
  extraFieldName,
  halfFieldCount,
} from "./enquiry-fields";

const TURNKEY: readonly EnquirySelectField[] = [
  { name: "ptype", label: "Project Type", options: ["Residential", "Commercial"] },
  { name: "budget", label: "Budget Range", options: ["Under ₹50 lakh", "₹1.5 crore +"] },
  { name: "timeline", label: "Timeline", options: ["Within 3 months", "Just exploring"] },
];

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("extraFieldName", () => {
  it("namespaces extra selects so they never collide with lead fields", () => {
    expect(extraFieldName("budget")).toBe("extra:budget");
  });
});

describe("collectExtra", () => {
  it("returns answered selects keyed by label", () => {
    const data = form({ "extra:ptype": "Residential", "extra:budget": "₹1.5 crore +" });
    expect(collectExtra(data, TURNKEY)).toEqual({
      "Project Type": "Residential",
      "Budget Range": "₹1.5 crore +",
    });
  });

  it("returns undefined when nothing was answered", () => {
    expect(collectExtra(form({ "extra:ptype": "" }), TURNKEY)).toBeUndefined();
    expect(collectExtra(form({}), [])).toBeUndefined();
  });

  it("drops values that are not one of the options", () => {
    expect(collectExtra(form({ "extra:ptype": "Spaceship" }), TURNKEY)).toBeUndefined();
  });

  it("ignores same-named lead fields (KI-C13: the popup's budget is a different question)", () => {
    expect(collectExtra(form({ budget: "Under ₹50 lakh" }), TURNKEY)).toBeUndefined();
  });

  it("produces a record the shared lead schema accepts", () => {
    const extra = collectExtra(form({ "extra:timeline": "Just exploring" }), TURNKEY);
    const result = leadSchema.safeParse({
      name: "Jane",
      email: "jane@email.com",
      service: "Turnkey Projects",
      extra,
      source: { form: "contact", path: "/services/turnkey", title: "Turnkey" },
    });
    expect(result.success).toBe(true);
  });
});

describe("halfFieldCount", () => {
  it("counts name, email, phone, the service select and the extras", () => {
    expect(halfFieldCount({ mode: "select" }, 2)).toBe(6); // interior: even, no spanning
    expect(halfFieldCount({ mode: "select" }, 3)).toBe(7); // turnkey: odd (KI-L22)
    expect(halfFieldCount({ mode: "hidden", service: "Interior Design" }, 2)).toBe(5); // factory
  });
});
