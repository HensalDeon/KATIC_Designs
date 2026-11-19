import { createRateLimiter } from "@/lib/leads/rate-limit";
import { leadFieldErrors, type LeadResponse, leadSchema } from "@/lib/leads/schema";

/**
 * Lead intake. Validates with the same schema as the browser, drops honeypot submissions,
 * rate-limits per client, then forwards to LEADS_ENDPOINT (the Laravel API from Phase 11).
 *
 * Without an endpoint: development logs the lead and reports success; production answers 503 so
 * the visitor is offered the email / WhatsApp fallback instead of losing the enquiry (KI-F02).
 */
const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
const FORWARD_TIMEOUT_MS = 10_000;

const json = (body: LeadResponse, status: number) => Response.json(body, { status });

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, status: "bad-request" }, 400);
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, status: "invalid", errors: leadFieldErrors(parsed.error) }, 422);
  }

  const { company_website: honeypot, ...lead } = parsed.data;
  // Pretend success so bots learn nothing.
  if (honeypot) return json({ ok: true, status: "sent" }, 202);

  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(client)) return json({ ok: false, status: "rate-limited" }, 429);

  const payload = {
    ...lead,
    submittedAt: new Date().toISOString(),
    subject: `Project enquiry — ${lead.service} (${lead.source.title})`,
    userAgent: request.headers.get("user-agent") ?? undefined,
  };

  const endpoint = process.env["LEADS_ENDPOINT"];
  if (!endpoint) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[leads] LEADS_ENDPOINT is not set; lead not delivered:", payload);
      return json({ ok: true, status: "logged" }, 202);
    }
    return json({ ok: false, status: "unavailable" }, 503);
  }

  return (await forward(endpoint, payload))
    ? json({ ok: true, status: "sent" }, 202)
    : json({ ok: false, status: "failed" }, 502);
}

/** POSTs the lead; retries once on network errors and 5xx (never on 4xx: KI-F04). */
async function forward(endpoint: string, payload: unknown): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
      });
      if (response.ok) return true;
      if (response.status < 500) return false;
    } catch {
      // Network error or timeout: retry once.
    }
  }
  return false;
}
