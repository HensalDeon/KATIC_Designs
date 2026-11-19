import type { Lead, LeadResponse } from "./schema";

const STORAGE_KEY = "katic:last-lead";

/** What /thank-you shows about the enquiry just sent (survives a reload: KI-F06). */
export type LastLead = {
  readonly name: string;
  readonly service: string;
  readonly sourceTitle: string;
  readonly sourcePath: string;
  /** `unsent`: delivery failed, so /thank-you offers the email / WhatsApp fallback. */
  readonly status: "sent" | "unsent";
  readonly details?: string;
};

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
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LastLead) : null;
  } catch {
    return null;
  }
}
