import { describe, expect, it, vi } from "vitest";

import { forwardLead, type LeadPayload } from "./forward";

const payload: LeadPayload = {
  name: "Jane Doe",
  email: "jane@email.com",
  service: "Interior Design",
  source: { form: "popup", path: "/", title: "Home" },
  submittedAt: "2026-11-20T12:00:00.000Z",
  subject: "Project enquiry — Interior Design (Home)",
};

function fakeFetch(...outcomes: (number | Error)[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = vi.fn((url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: url instanceof Request ? url.url : url.toString(), init: init ?? {} });
    const outcome = outcomes[calls.length - 1] ?? 500;
    return outcome instanceof Error
      ? Promise.reject(outcome)
      : Promise.resolve(new Response("{}", { status: outcome }));
  });
  return { impl: impl as unknown as typeof fetch, calls };
}

const header = (init: RequestInit, name: string) => (init.headers as Record<string, string>)[name];

describe("forwardLead", () => {
  it("POSTs the JSON payload with an idempotency key and the bearer token", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { impl, calls } = fakeFetch(201);
    const result = await forwardLead("https://api.test/leads", payload, {
      token: "tok",
      idempotencyKey: "key-1",
      fetchImpl: impl,
    });
    expect(result).toEqual({ delivered: true });
    expect(calls).toHaveLength(1);
    const [call] = calls;
    expect(call?.url).toBe("https://api.test/leads");
    expect(call?.init.method).toBe("POST");
    expect(JSON.parse(call?.init.body as string)).toEqual(payload);
    expect(header(call?.init ?? {}, "Authorization")).toBe("Bearer tok");
    expect(header(call?.init ?? {}, "Idempotency-Key")).toBe("key-1");
    expect(header(call?.init ?? {}, "Accept")).toBe("application/json");
  });

  it("omits Authorization without a token and generates a key", async () => {
    const { impl, calls } = fakeFetch(202);
    await forwardLead("https://api.test/leads", payload, { fetchImpl: impl });
    const init = calls[0]?.init ?? {};
    expect(header(init, "Authorization")).toBeUndefined();
    expect(header(init, "Idempotency-Key")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("retries once on 5xx and network errors with the same key", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const first = fakeFetch(503, 201);
    expect(await forwardLead("u", payload, { fetchImpl: first.impl })).toEqual({ delivered: true });
    const keys = first.calls.map(({ init }) => header(init, "Idempotency-Key"));
    expect(keys[0]).toBe(keys[1]);

    const second = fakeFetch(new TypeError("fetch failed"), new TypeError("fetch failed"));
    expect(await forwardLead("u", payload, { fetchImpl: second.impl })).toEqual({
      delivered: false,
      reason: "unreachable",
    });
    expect(second.calls).toHaveLength(2);
  });

  it("maps 4xx without retrying: 409 delivered, 429 rate-limited, others rejected", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    for (const [status, expected] of [
      [409, { delivered: true }],
      [429, { delivered: false, reason: "rate-limited" }],
      [422, { delivered: false, reason: "rejected" }],
      [401, { delivered: false, reason: "rejected" }],
    ] as const) {
      const { impl, calls } = fakeFetch(status, 201);
      expect(await forwardLead("u", payload, { fetchImpl: impl }), String(status)).toEqual(
        expected,
      );
      expect(calls).toHaveLength(1);
    }
  });
});
