import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  type LaravelClientConfig,
  laravelGet,
  LaravelHttpError,
  LaravelNetworkError,
  LaravelSchemaError,
} from "./http";

const schema = z.object({ slug: z.string() });

function client(...outcomes: (Response | Error)[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = vi.fn((url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: url instanceof Request ? url.url : url.toString(), init: init ?? {} });
    const outcome = outcomes[calls.length - 1] ?? new Response("", { status: 500 });
    return outcome instanceof Error ? Promise.reject(outcome) : Promise.resolve(outcome);
  });
  const config: LaravelClientConfig = {
    baseUrl: "https://cms.test/api/v1/",
    token: "tok",
    timeoutMs: 1000,
    fetchImpl,
  };
  return { config, calls };
}

const ok = (data: unknown) => Response.json({ data });

describe("laravelGet", () => {
  it("sends the bearer token and unwraps the data envelope", async () => {
    const { config, calls } = client(ok({ slug: "a", extra: true }));
    await expect(laravelGet(config, "/posts/a", schema)).resolves.toEqual({ slug: "a" });
    expect(calls[0]?.url).toBe("https://cms.test/api/v1/posts/a");
    expect(calls[0]?.init.headers).toEqual({
      Accept: "application/json",
      Authorization: "Bearer tok",
    });
    expect(calls[0]?.init.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns null for 404 only when allowed", async () => {
    const notFound = () => new Response('{"message":"Not found."}', { status: 404 });
    await expect(
      laravelGet(client(notFound()).config, "/posts/x", schema, { allowNotFound: true }),
    ).resolves.toBeNull();
    const error = await laravelGet(client(notFound()).config, "/site", schema).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(LaravelHttpError);
    expect(error).toMatchObject({ kind: "http", status: 404 });
  });

  it("retries once on 5xx and network errors, never on 4xx", async () => {
    const retried = client(new Response("", { status: 503 }), ok({ slug: "b" }));
    await expect(laravelGet(retried.config, "/p", schema)).resolves.toEqual({ slug: "b" });
    expect(retried.calls).toHaveLength(2);

    const down = client(new TypeError("fetch failed"), new TypeError("fetch failed"));
    const error = await laravelGet(down.config, "/p", schema).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(LaravelNetworkError);
    expect(error).toMatchObject({ kind: "network" });
    expect(down.calls).toHaveLength(2);

    const denied = client(new Response("no", { status: 401 }), ok({ slug: "c" }));
    await expect(laravelGet(denied.config, "/p", schema)).rejects.toMatchObject({ status: 401 });
    expect(denied.calls).toHaveLength(1);
  });

  it("reports timeouts as their own kind", async () => {
    const timeout = new DOMException("The operation timed out.", "TimeoutError");
    const { config } = client(timeout, timeout);
    await expect(laravelGet(config, "/p", schema)).rejects.toMatchObject({ kind: "timeout" });
  });

  it("rejects bodies that break the contract with the failing paths", async () => {
    const wrong = await laravelGet(client(ok({ slug: 1 })).config, "/p", schema).catch(
      (e: unknown) => e,
    );
    expect(wrong).toBeInstanceOf(LaravelSchemaError);
    expect((wrong as LaravelSchemaError).issues[0]).toMatch(/^data\.slug:/);

    const bare = client(Response.json({ slug: "a" }));
    await expect(laravelGet(bare.config, "/p", schema)).rejects.toThrow(/"data" envelope/);
    const html = client(new Response("<html>", { status: 200 }));
    await expect(laravelGet(html.config, "/p", schema)).rejects.toThrow(/not JSON/);
  });
});
