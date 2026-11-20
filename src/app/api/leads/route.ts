import { forwardLead, type LeadPayload } from "@/lib/leads/forward";
import { createRateLimiter } from "@/lib/leads/rate-limit";
import { leadFieldErrors, type LeadResponse, leadSchema } from "@/lib/leads/schema";

/**
 * Lead intake. Validates with the same schema as the browser, drops honeypot submissions,
 * rate-limits per client, then forwards to LEADS_ENDPOINT (Laravel `POST /leads`, Phase 11;
 * contract in docs/API_CONTRACT.md, delivery rules in `src/lib/leads/forward.ts`).
 *
 * Without an endpoint: development logs the lead and reports success; production answers 503 so
 * the visitor is offered the email / WhatsApp fallback instead of losing the enquiry (KI-F02).
 */
const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

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

  const userAgent = request.headers.get("user-agent");
  const payload: LeadPayload = {
    ...lead,
    submittedAt: new Date().toISOString(),
    subject: `Project enquiry — ${lead.service} (${lead.source.title})`,
    ...(userAgent ? { userAgent } : {}),
  };

  const endpoint = process.env["LEADS_ENDPOINT"];
  if (!endpoint) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[leads] LEADS_ENDPOINT is not set; lead not delivered:", payload);
      return json({ ok: true, status: "logged" }, 202);
    }
    return json({ ok: false, status: "unavailable" }, 503);
  }

  const result = await forwardLead(endpoint, payload, { token: process.env["LEADS_API_TOKEN"] });
  if (result.delivered) return json({ ok: true, status: "sent" }, 202);
  if (result.reason === "rate-limited") return json({ ok: false, status: "rate-limited" }, 429);
  return json({ ok: false, status: "failed" }, 502);
}
