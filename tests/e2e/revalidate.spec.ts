import { createHmac } from "node:crypto";

import { type APIRequestContext, expect, test } from "@playwright/test";

/**
 * POST /api/revalidate, the signed Laravel → Next.js webhook (Phase 11). The signature scheme is
 * unit-tested in src/lib/revalidate; this checks the deployed route end to end. Signed cases need
 * the server's REVALIDATE_SECRET in this process's environment.
 */
const secret = process.env["REVALIDATE_SECRET"];

function sign(body: string, key: string, timestamp = Math.floor(Date.now() / 1000)) {
  const digest = createHmac("sha256", key).update(`${timestamp}.${body}`).digest("hex");
  return {
    "content-type": "application/json",
    "x-katic-timestamp": String(timestamp),
    "x-katic-signature": `sha256=${digest}`,
  };
}

const post = (request: APIRequestContext, body: string, headers: Record<string, string>) =>
  request.post("/api/revalidate", { data: body, headers });

test.describe("POST /api/revalidate", () => {
  test.skip(({ isMobile }) => isMobile, "API only: one project is enough");

  test("only accepts POST", async ({ request }) => {
    expect((await request.get("/api/revalidate")).status()).toBe(405);
  });

  test("rejects unsigned and wrongly signed requests", async ({ request }) => {
    const body = JSON.stringify({ tags: ["posts"] });
    const unsigned = await post(request, body, { "content-type": "application/json" });
    test.skip(unsigned.status() === 503, "server has no REVALIDATE_SECRET");
    expect(unsigned.status()).toBe(401);
    expect(await unsigned.json()).toEqual({ ok: false, error: "unauthorized" });

    const forged = await post(request, body, sign(body, "not-the-secret-0123"));
    expect(forged.status()).toBe(401);

    const stale = await post(request, body, sign(body, secret ?? "x", 1_000_000_000));
    expect(stale.status()).toBe(401);
  });

  test("validates the body and revalidates the tags", async ({ request }) => {
    test.skip(!secret, "REVALIDATE_SECRET is not set for this run");
    const key = secret ?? "";

    const invalid = JSON.stringify({ tags: ["not a tag"] });
    const bad = await post(request, invalid, sign(invalid, key));
    test.skip(bad.status() === 503, "server has no REVALIDATE_SECRET");
    expect(bad.status()).toBe(400);
    expect(await bad.json()).toMatchObject({ ok: false, error: "invalid" });

    const body = JSON.stringify({ tags: ["e2e-probe", "e2e:probe/1"] });
    const ok = await post(request, body, sign(body, key));
    expect(ok.status()).toBe(200);
    expect(await ok.json()).toMatchObject({
      ok: true,
      revalidated: ["e2e-probe", "e2e:probe/1"],
      immediate: false,
    });
  });
});
