import { z } from "zod";

import { SERVICE_NOT_SURE, SERVICE_OPTIONS } from "@/content/services";

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

const optionalText = (max: number) => z.string().trim().max(max).optional();

/**
 * One enquiry ("lead"), validated identically in the browser and in /api/leads.
 * Messages are user-facing and shown inline next to the field (KI-F03).
 */
export const leadSchema = z.object({
  name: z.string().trim().min(1, "Please enter your full name.").max(120),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .pipe(z.email("Please enter a valid email address.")),
  phone: optionalText(40),
  service: z.enum([...SERVICE_OPTIONS, SERVICE_NOT_SURE], { error: "Please choose a service." }),
  location: z.enum(LEAD_LOCATIONS).optional(),
  projectType: z.enum(PROJECT_TYPES).optional(),
  timeline: z.enum(TIMELINES).optional(),
  budget: z.enum(BUDGETS).optional(),
  details: optionalText(4000),
  /** Page-specific extra selects of inline contact forms, sent as label → value. */
  extra: z.record(z.string().max(60), z.string().max(200)).optional(),
  source: z.object({
    form: z.enum(["popup", "contact"]),
    path: z.string().max(300),
    title: z.string().max(200),
  }),
  /** Honeypot: hidden from people, filled in by naive bots (original `company_website`). */
  company_website: z.string().max(200).optional(),
});

export type Lead = z.infer<typeof leadSchema>;
export type LeadField = keyof Lead;
export type LeadFieldErrors = Partial<Record<LeadField, string>>;

/** First message per field, for inline display. */
export function leadFieldErrors(error: z.ZodError): LeadFieldErrors {
  const { fieldErrors } = z.flattenError(error);
  return Object.fromEntries(
    Object.entries(fieldErrors).flatMap(([field, messages]) =>
      Array.isArray(messages) && messages[0] ? [[field, messages[0]]] : [],
    ),
  );
}

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

/** Response contract of POST /api/leads. */
export type LeadResponse =
  | { ok: true; status: "sent" | "logged" }
  | { ok: false; status: "invalid"; errors: LeadFieldErrors }
  | { ok: false; status: "rate-limited" | "unavailable" | "failed" | "bad-request" };
