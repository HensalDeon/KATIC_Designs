import type { Lead, LeadResponse } from "./schema";

/** sessionStorage key of the last lead (also read by the /thank-you pre-paint script). */
export const LAST_LEAD_STORAGE_KEY = "katic:last-lead";
const STORAGE_KEY = LAST_LEAD_STORAGE_KEY;

/** What /thank-you shows about the enquiry just sent (survives a reload: KI-F06). */
export type LastLead = {
  readonly name: string;
  readonly service: string;
  readonly sourceTitle: string;
  readonly sourcePath: string;
  /** `unsent`: delivery failed, so /thank-you offers the email / WhatsApp fallback. */
  readonly status: "sent" | "unsent";
  /** Contact details, for the fallback's email / WhatsApp / copy summary (original `lastLead.body`). */
  readonly email?: string;
  readonly phone?: string;
  readonly details?: string;
  /** Which form sent it (optional: leads remembered before this field existed lack it). */
  readonly form?: Lead["source"]["form"];
  /** Answers to the form's other selects (label → value): page-specific or the popup's. */
  readonly extra?: Readonly<Record<string, string>>;
};

/** Labels of the popup's optional selects, as the popup shows them. */
const POPUP_SELECT_LABELS = {
  location: "Project location",
  projectType: "Project type",
  timeline: "Timeline",
  budget: "Budget range",
} as const satisfies Partial<Record<keyof Lead, string>>;

/** What to remember of a validated lead once it was sent (or failed to send). */
export function toLastLead(lead: Lead, status: LastLead["status"]): LastLead {
  const answers = Object.entries(POPUP_SELECT_LABELS).flatMap(([field, label]) => {
    const value = lead[field as keyof typeof POPUP_SELECT_LABELS];
    return value ? [[label, value] as const] : [];
  });
  const extra = { ...Object.fromEntries(answers), ...lead.extra };
  return {
    name: lead.name,
    service: lead.service,
    sourceTitle: lead.source.title,
    sourcePath: lead.source.path,
    status,
    form: lead.source.form,
    email: lead.email,
    ...(lead.phone ? { phone: lead.phone } : {}),
    ...(lead.details ? { details: lead.details } : {}),
    ...(Object.keys(extra).length > 0 ? { extra } : {}),
  };
}

export async function submitLead(lead: Lead): Promise<LeadResponse> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    return (await response.json()) as LeadResponse;
  } catch {
    return { ok: false, status: "failed" };
  }
}

export function rememberLead(lead: LastLead): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
  } catch {
    // Storage can be unavailable (private mode); /thank-you then shows generic copy.
  }
}

export function readLastLead(): LastLead | null {
  return parseLastLead(readLastLeadRaw());
}

/** The stored lead as a string (a stable snapshot for `useSyncExternalStore`). */
export function readLastLeadRaw(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Parses a stored lead, or `null` when it is missing or not a lead (e.g. edited by hand). */
export function parseLastLead(raw: string | null): LastLead | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const lead = value as Partial<Record<keyof LastLead, unknown>>;
    const isText = (key: keyof LastLead) => typeof lead[key] === "string";
    return isText("name") &&
      isText("service") &&
      isText("sourceTitle") &&
      isText("sourcePath") &&
      (lead.status === "sent" || lead.status === "unsent")
      ? (value as LastLead)
      : null;
  } catch {
    return null;
  }
}
