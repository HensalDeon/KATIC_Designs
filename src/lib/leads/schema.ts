import { z } from "zod";

import { SERVICE_NOT_SURE, SERVICE_OPTIONS } from "@/content/services";

import { BUDGETS, LEAD_LOCATIONS, PROJECT_TYPES, TIMELINES } from "./fields";

export { BUDGETS, formDataToLead, LEAD_LOCATIONS, PROJECT_TYPES, TIMELINES } from "./fields";

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

/** Validates a lead candidate: the lead, or the first message per invalid field. */
export function validateLead(
  candidate: unknown,
): { ok: true; lead: Lead } | { ok: false; errors: LeadFieldErrors } {
  const parsed = leadSchema.safeParse(candidate);
  return parsed.success
    ? { ok: true, lead: parsed.data }
    : { ok: false, errors: leadFieldErrors(parsed.error) };
}

/** Response contract of POST /api/leads. */
export type LeadResponse =
  | { ok: true; status: "sent" | "logged" }
  | { ok: false; status: "invalid"; errors: LeadFieldErrors }
  | { ok: false; status: "rate-limited" | "unavailable" | "failed" | "bad-request" };
