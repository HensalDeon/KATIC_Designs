import type { Lead } from "./schema";

/**
 * What /api/leads sends to LEADS_ENDPOINT (Laravel `POST /leads`, docs/API_CONTRACT.md): the
 * validated lead without the honeypot, plus server-side fields.
 */
export type LeadPayload = Omit<Lead, "company_website"> & {
  submittedAt: string;
  subject: string;
  userAgent?: string;
};

/** Outcome of delivering one lead; maps 1:1 onto the `/api/leads` response (P9-03). */
export type ForwardResult =
  { delivered: true } | { delivered: false; reason: "rate-limited" | "rejected" | "unreachable" };

export const FORWARD_TIMEOUT_MS = 10_000;
export const FORWARD_ATTEMPTS = 2;

/**
 * POSTs the lead to Laravel. One `Idempotency-Key` per submission, reused on the retry, so a lead
 * whose first attempt timed out after Laravel stored it is not stored twice. Retries once on
 * network errors, timeouts and 5xx; never on 4xx (KI-F04).
 *
 * - 2xx, or 409 (Laravel already has this key) → delivered.
 * - 429 → `rate-limited` (the form asks the visitor to try again later).
 * - other 4xx (401/403 token, 422 contract drift) → `rejected`, logged as a server error.
 * - 5xx / network / timeout twice → `unreachable`.
 * Anything not delivered sends the visitor to /thank-you with the email / WhatsApp fallback.
 */
export async function forwardLead(
  endpoint: string,
  payload: LeadPayload,
  {
    token,
    idempotencyKey = crypto.randomUUID(),
    timeoutMs = FORWARD_TIMEOUT_MS,
    fetchImpl = fetch,
  }: {
    token?: string | undefined;
    idempotencyKey?: string;
    timeoutMs?: number;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<ForwardResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Idempotency-Key": idempotencyKey,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const body = JSON.stringify(payload);

  for (let attempt = 0; attempt < FORWARD_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      if (response.ok || response.status === 409) return { delivered: true };
      if (response.status === 429) return { delivered: false, reason: "rate-limited" };
      if (response.status < 500) {
        console.error(`[leads] LEADS_ENDPOINT rejected the lead: HTTP ${response.status}`);
        return { delivered: false, reason: "rejected" };
      }
    } catch {
      // Network error or timeout: retry once.
    }
  }
  console.error("[leads] LEADS_ENDPOINT unreachable after retry");
  return { delivered: false, reason: "unreachable" };
}
