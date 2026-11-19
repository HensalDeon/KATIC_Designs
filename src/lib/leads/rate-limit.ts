/**
 * Small fixed-window limiter for /api/leads. Best effort only: state lives in one server
 * instance's memory. The Laravel API must enforce its own limit (Phase 11).
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function allow(key: string, now = Date.now()): boolean {
    for (const [k, entry] of hits) if (entry.resetAt <= now) hits.delete(k);

    const entry = hits.get(key);
    if (!entry) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}
