import { describe, expect, it, vi } from "vitest";

import { handleRevalidate, MAX_BODY_BYTES } from "./handler";
import {
  MAX_SKEW_SECONDS,
  SIGNATURE_HEADER,
  signRevalidateBody,
  TIMESTAMP_HEADER,
  verifyRevalidateSignature,
} from "./signature";

const SECRET = "test-secret-0123456789";
const NOW = Date.UTC(2026, 10, 20, 12);
const SECONDS = Math.floor(NOW / 1000);

function signedRequest(
  body: string,
  { secret = SECRET, timestamp = SECONDS }: { secret?: string; timestamp?: number } = {},
) {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      [TIMESTAMP_HEADER]: String(timestamp),
      [SIGNATURE_HEADER]: signRevalidateBody(secret, timestamp, body),
    },
    body,
  });
}

describe("verifyRevalidateSignature", () => {
  const body = '{"tags":["posts"]}';
  const signature = signRevalidateBody(SECRET, SECONDS, body);
  const check = (overrides: Partial<Parameters<typeof verifyRevalidateSignature>[0]>) =>
    verifyRevalidateSignature({
      secret: SECRET,
      body,
      signature,
      timestamp: String(SECONDS),
      now: NOW,
      ...overrides,
    });

  it("accepts the HMAC-SHA256 of '<timestamp>.<body>'", () => {
    expect(signature).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(check({})).toEqual({ ok: true });
  });

  it("matches an independent HMAC implementation for a known vector", () => {
    // printf '%s' '1700000000.{"tags":["posts"]}' | openssl dgst -sha256 -hmac 'test-secret-0123456789'
    // (= PHP hash_hmac('sha256', '1700000000.'.$body, $secret))
    expect(signRevalidateBody(SECRET, 1_700_000_000, body)).toBe(
      "sha256=053f7dcbe419b4eace7349af6c534af264c53efe0f21803998e97d7b66bdd536",
    );
  });

  it("rejects missing, malformed, tampered and wrong-secret signatures", () => {
    expect(check({ signature: null })).toEqual({ ok: false, reason: "missing" });
    expect(check({ timestamp: null })).toEqual({ ok: false, reason: "missing" });
    expect(check({ signature: "md5=abc" })).toEqual({ ok: false, reason: "malformed" });
    expect(check({ timestamp: "soon" })).toEqual({ ok: false, reason: "malformed" });
    expect(check({ body: '{"tags":["pages"]}' })).toEqual({ ok: false, reason: "mismatch" });
    expect(check({ secret: "another-secret-0123" })).toEqual({ ok: false, reason: "mismatch" });
    expect(check({ signature: "sha256=00" })).toEqual({ ok: false, reason: "mismatch" });
  });

  it("rejects timestamps outside the replay window", () => {
    const old = SECONDS - MAX_SKEW_SECONDS - 1;
    expect(
      check({ timestamp: String(old), signature: signRevalidateBody(SECRET, old, body) }),
    ).toEqual({ ok: false, reason: "expired" });
    const edge = SECONDS - MAX_SKEW_SECONDS;
    expect(
      check({ timestamp: String(edge), signature: signRevalidateBody(SECRET, edge, body) }),
    ).toEqual({ ok: true });
  });
});

describe("handleRevalidate", () => {
  const run = (request: Request, secret: string | null = SECRET) => {
    const revalidate = vi.fn<(tag: string, immediate: boolean) => void>();
    return {
      revalidate,
      response: handleRevalidate(request, { secret: secret ?? undefined, revalidate, now: NOW }),
    };
  };

  it("revalidates every distinct tag and reports them", async () => {
    const { revalidate, response } = run(signedRequest('{"tags":["posts","post:a-b","posts"]}'));
    const res = await response;
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      revalidated: ["posts", "post:a-b"],
      immediate: false,
      now: NOW,
    });
    expect(revalidate.mock.calls).toEqual([
      ["posts", false],
      ["post:a-b", false],
    ]);
  });

  it("passes `immediate` through", async () => {
    const { revalidate, response } = run(signedRequest('{"tags":["site"],"immediate":true}'));
    expect((await response).status).toBe(200);
    expect(revalidate).toHaveBeenCalledWith("site", true);
  });

  it("answers 401 before looking at the body when the signature is wrong", async () => {
    const { revalidate, response } = run(
      signedRequest("not json", { secret: "wrong-secret-0000" }),
    );
    const res = await response;
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ ok: false, error: "unauthorized" });
    expect(revalidate).not.toHaveBeenCalled();
  });

  it("answers 400 for bodies that are not JSON or not a tag list", async () => {
    for (const body of [
      "not json",
      "{}",
      '{"tags":[]}',
      '{"tags":["has space"]}',
      '{"tags":["-leading-dash"]}',
      `{"tags":["${"a".repeat(129)}"]}`,
      `{"tags":${JSON.stringify(Array.from({ length: 101 }, (_, i) => `t${i}`))}}`,
      '{"tags":["posts"],"extra":1}',
      '{"tags":"posts"}',
    ]) {
      const { revalidate, response } = run(signedRequest(body));
      expect((await response).status, body).toBe(400);
      expect(revalidate).not.toHaveBeenCalled();
    }
  });

  it("answers 413 for oversized bodies", async () => {
    const body = JSON.stringify({ tags: ["x"], pad: "y".repeat(MAX_BODY_BYTES) });
    expect((await run(signedRequest(body)).response).status).toBe(413);
  });

  it("answers 503 when no secret is configured", async () => {
    expect((await run(signedRequest('{"tags":["posts"]}'), null).response).status).toBe(503);
  });
});
