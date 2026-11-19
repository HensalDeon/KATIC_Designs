import { describe, expect, it } from "vitest";

import { LAST_LEAD_STORAGE_KEY, type LastLead, parseLastLead, toLastLead } from "./client";
import type { Lead } from "./schema";
import {
  enquiryMailto,
  LEAD_STATUS_ATTRIBUTE,
  leadSourceLabel,
  leadSummary,
  THANK_YOU_PREPAINT_SCRIPT,
  whatsappMessage,
} from "./thank-you";

const LEAD: LastLead = {
  name: "Jane Doe",
  email: "jane@email.com",
  phone: "+91 98000 00000",
  service: "Interior Design",
  sourceTitle: "Architects & Interior Designers in Dubai, UAE | Katic Designs",
  sourcePath: "/locations/dubai",
  status: "unsent",
  form: "contact",
  extra: { Location: "Dubai, UAE" },
  details: "Two bedrooms.",
};

describe("leadSourceLabel", () => {
  it("reads the page name from the title, Home for the home page, Website without a lead", () => {
    expect(leadSourceLabel(LEAD)).toBe("Architects & Interior Designers in Dubai, UAE");
    expect(
      leadSourceLabel({
        sourcePath: "/",
        sourceTitle: "Architects, Interior Designers & Builders in Kochi, Kerala | Katic Designs",
      }),
    ).toBe("Home");
    expect(leadSourceLabel({ sourcePath: "/x", sourceTitle: "" })).toBe("Website");
    expect(leadSourceLabel(null)).toBe("Website");
  });
});

describe("leadSummary / whatsappMessage / enquiryMailto", () => {
  it("summarises the enquiry like the original lastLead.body", () => {
    expect(leadSummary(LEAD)).toBe(
      [
        "Name: Jane Doe",
        "Email: jane@email.com",
        "Phone: +91 98000 00000",
        "Service: Interior Design",
        "Source page: Architects & Interior Designers in Dubai, UAE",
        "Location: Dubai, UAE",
        "",
        "Two bedrooms.",
      ].join("\n"),
    );
  });

  it("pre-fills WhatsApp with the enquiry, or a generic line on a direct visit", () => {
    expect(whatsappMessage(LEAD)).toBe(`Hi KATIC, here is my enquiry:\n\n${leadSummary(LEAD)}`);
    expect(whatsappMessage(null)).toBe("Hi KATIC, I just sent an enquiry about a project.");
  });

  it("builds the fallback mailto with the original subject", () => {
    const href = enquiryMailto("hello@katicdesigns.com", LEAD);
    const url = new URL(href);
    expect(url.protocol).toBe("mailto:");
    expect(url.searchParams.get("subject")).toBe("Project enquiry — Interior Design");
    expect(url.searchParams.get("body")).toBe(leadSummary(LEAD));
  });
});

describe("toLastLead / parseLastLead", () => {
  const lead: Lead = {
    name: "Jane Doe",
    email: "jane@email.com",
    service: "Turnkey Projects",
    projectType: "Apartment",
    budget: "Prefer to discuss",
    source: { form: "popup", path: "/about", title: "About Katic Designs | Studio" },
  };

  it("keeps contact details and labels the popup's answers", () => {
    expect(toLastLead(lead, "sent")).toEqual({
      name: "Jane Doe",
      email: "jane@email.com",
      service: "Turnkey Projects",
      sourceTitle: "About Katic Designs | Studio",
      sourcePath: "/about",
      status: "sent",
      form: "popup",
      extra: { "Project type": "Apartment", "Budget range": "Prefer to discuss" },
    });
  });

  it("round-trips through storage and rejects anything else", () => {
    const stored = toLastLead(lead, "unsent");
    expect(parseLastLead(JSON.stringify(stored))).toEqual(stored);
    expect(parseLastLead(null)).toBeNull();
    expect(parseLastLead("{")).toBeNull();
    expect(parseLastLead(JSON.stringify({ name: "x" }))).toBeNull();
    expect(parseLastLead(JSON.stringify({ ...stored, status: "queued" }))).toBeNull();
  });
});

describe("THANK_YOU_PREPAINT_SCRIPT", () => {
  /** Runs the inline script against a minimal DOM and storage. */
  function run(stored: unknown) {
    const nodes = {
      source: { textContent: "Website" },
      service: { textContent: "General enquiry" },
    };
    const attributes: Record<string, string> = {};
    const document = {
      querySelector: (selector: string) =>
        selector === "[data-lead-source]" ? nodes.source : nodes.service,
      documentElement: {
        setAttribute: (name: string, value: string) => (attributes[name] = value),
      },
    };
    const sessionStorage = {
      getItem: (key: string) =>
        key === LAST_LEAD_STORAGE_KEY && stored !== undefined ? JSON.stringify(stored) : null,
    };
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- the inline script under test
    const script = new Function("document", "sessionStorage", THANK_YOU_PREPAINT_SCRIPT) as (
      doc: typeof document,
      storage: typeof sessionStorage,
    ) => void;
    script(document, sessionStorage);
    return { source: nodes.source.textContent, service: nodes.service.textContent, attributes };
  }

  it("writes the same labels as the island and flags a failed delivery", () => {
    expect(run(LEAD)).toEqual({
      source: leadSourceLabel(LEAD),
      service: "Interior Design",
      attributes: { [LEAD_STATUS_ATTRIBUTE]: "unsent" },
    });
    expect(run({ ...LEAD, sourcePath: "/", status: "sent" })).toEqual({
      source: "Home",
      service: "Interior Design",
      attributes: {},
    });
  });

  it("leaves the generic shell alone without a lead", () => {
    expect(run(undefined)).toEqual({
      source: "Website",
      service: "General enquiry",
      attributes: {},
    });
  });
});
