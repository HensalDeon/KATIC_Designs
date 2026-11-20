import { z } from "zod";

import { SIGNATURE_HEADER, TIMESTAMP_HEADER, verifyRevalidateSignature } from "./signature";

/** Largest accepted body: 100 tags of 128 characters fit comfortably. */
export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_TAGS = 100;

/**
 * Cache tags are short ASCII identifiers (`posts`, `post:villa-in-kochi`, `media`). Next accepts up
 * to 256 characters; the narrower charset keeps webhook input out of logs and URLs unescaped.
 */
export const CACHE_TAG = /^[A-Za-z0-9][A-Za-z0-9:._/-]{0,127}$/;

export const revalidateBodySchema = z.strictObject({
  tags: z
    .array(z.string().regex(CACHE_TAG, "invalid cache tag"))
    .min(1)
    .max(MAX_TAGS)
    .transform((tags) => [...new Set(tags)]),
  /**
   * `false` (default): stale-while-revalidate (`revalidateTag(tag, "max")`): the next visit is
   * served the old page while the new one renders. `true`: expire now (`{ expire: 0 }`): the next
   * visit waits for fresh content. Use it for corrections that must not be seen again (e.g. legal).
   */
  immediate: z.boolean().optional(),
});

export type RevalidateBody = z.infer<typeof revalidateBodySchema>;

export type RevalidateResponse =
  | { ok: true; revalidated: string[]; immediate: boolean; now: number }
  | {
      ok: false;
      error: "not-configured" | "unauthorized" | "bad-request" | "invalid" | "too-large";
      issues?: string[];
    };

const json = (body: RevalidateResponse, status: number) => Response.json(body, { status });

/**
 * POST /api/revalidate, independent of Next's cache so it can be unit-tested: verifies the
 * signature over the raw body first (401), then validates it (400), then calls `revalidate` for
 * every tag (200).
 */
export async function handleRevalidate(
  request: Request,
  {
    secret,
    revalidate,
    now = Date.now(),
  }: {
    secret: string | undefined;
    revalidate: (tag: string, immediate: boolean) => void;
    now?: number;
  },
): Promise<Response> {
  if (!secret) return json({ ok: false, error: "not-configured" }, 503);

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return json({ ok: false, error: "too-large" }, 413);
  const body = await request.text();
  if (Buffer.byteLength(body) > MAX_BODY_BYTES) return json({ ok: false, error: "too-large" }, 413);

  const check = verifyRevalidateSignature({
    secret,
    body,
    signature: request.headers.get(SIGNATURE_HEADER),
    timestamp: request.headers.get(TIMESTAMP_HEADER),
    now,
  });
  if (!check.ok) return json({ ok: false, error: "unauthorized" }, 401);

  let candidate: unknown;
  try {
    candidate = JSON.parse(body);
  } catch {
    return json({ ok: false, error: "bad-request" }, 400);
  }
  const parsed = revalidateBodySchema.safeParse(candidate);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`);
    return json({ ok: false, error: "invalid", issues }, 400);
  }

  const immediate = parsed.data.immediate ?? false;
  for (const tag of parsed.data.tags) revalidate(tag, immediate);
  return json({ ok: true, revalidated: parsed.data.tags, immediate, now }, 200);
}
