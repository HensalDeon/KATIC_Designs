import type { Lead } from "./schema";

/**
 * The parts of the lead contract the forms need while rendering: select options and form-data
 * parsing. Kept free of zod so the client bundle of every page does not ship the validator; the
 * forms load `./schema` on demand when the visitor starts filling them in (`loadLeadValidator`).
 */

/** Popup select options, verbatim from the original. */
export const LEAD_LOCATIONS = ["Kerala", "Elsewhere in India", "Dubai / UAE", "Other"] as const;
export const PROJECT_TYPES = [
  "Home / Villa",
  "Apartment",
  "Commercial",
  "Hospitality",
  "Institutional",
] as const;
export const TIMELINES = [
  "As soon as possible",
  "Within 3 months",
  "3–6 months",
  "6–12 months",
  "Just exploring",
] as const;
export const BUDGETS = [
  "Under ₹50 lakh",
  "₹50 lakh – ₹1 crore",
  "₹1 – 3 crore",
  "Above ₹3 crore",
  "Prefer to discuss",
] as const;

/** Turns form data into a lead candidate, treating empty strings as "not provided". */
export function formDataToLead(data: FormData, source: Lead["source"]): Record<string, unknown> {
  const value = (name: string) => {
    const raw = data.get(name);
    return typeof raw === "string" && raw.trim() !== "" ? raw : undefined;
  };
  return {
    name: value("name") ?? "",
    email: value("email") ?? "",
    phone: value("phone"),
    service: value("service") ?? "",
    location: value("location"),
    projectType: value("projectType"),
    timeline: value("timeline"),
    budget: value("budget"),
    details: value("details"),
    company_website: value("company_website"),
    source,
  };
}

/**
 * Loads the lead validator (zod) in its own chunk. Call it early (first focus in a form) so the
 * chunk is ready by the time the form is submitted; repeated calls reuse the same module.
 */
export function loadLeadValidator() {
  return import("./schema").then((schema) => schema.validateLead);
}
