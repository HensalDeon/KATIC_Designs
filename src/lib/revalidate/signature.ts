import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signature of POST /api/revalidate (the Laravel → Next.js content webhook, Phase 11).
 *
 * Laravel sends:
 *   X-Katic-Timestamp: <unix seconds>
 *   X-Katic-Signature: sha256=<hex HMAC-SHA256 of "<timestamp>.<raw body>" keyed with REVALIDATE_SECRET>
 *
 * PHP: `'sha256='.hash_hmac('sha256', $timestamp.'.'.$body, config('services.next.revalidate_secret'))`.
 * The timestamp is signed too and must be within `MAX_SKEW_SECONDS` of the server clock, so a
 * captured request cannot be replayed later.
 */
export const SIGNATURE_HEADER = "x-katic-signature";
export const TIMESTAMP_HEADER = "x-katic-timestamp";
export const MAX_SKEW_SECONDS = 300;
const PREFIX = "sha256=";

export function signRevalidateBody(secret: string, timestamp: number, body: string): string {
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return `${PREFIX}${digest}`;
}

export type SignatureCheck =
  { ok: true } | { ok: false; reason: "missing" | "malformed" | "expired" | "mismatch" };

/** Verifies the headers against the raw body in constant time. `now` is in milliseconds. */
export function verifyRevalidateSignature({
  secret,
  body,
  signature,
  timestamp,
  now = Date.now(),
}: {
  secret: string;
  body: string;
  signature: string | null;
  timestamp: string | null;
  now?: number;
}): SignatureCheck {
  if (!signature || !timestamp) return { ok: false, reason: "missing" };
  if (!/^\d{1,12}$/.test(timestamp) || !signature.startsWith(PREFIX)) {
    return { ok: false, reason: "malformed" };
  }
  const seconds = Number(timestamp);
  if (Math.abs(now / 1000 - seconds) > MAX_SKEW_SECONDS) return { ok: false, reason: "expired" };

  const expected = Buffer.from(signRevalidateBody(secret, seconds, body));
  const received = Buffer.from(signature);
  // timingSafeEqual needs equal lengths; the length of a hex SHA-256 digest is public anyway.
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: "mismatch" };
  }
  return { ok: true };
}
