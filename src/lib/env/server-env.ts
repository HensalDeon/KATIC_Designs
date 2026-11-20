import { z } from "zod";

/**
 * Server-side environment (Phase 11): where content comes from, how Laravel is reached, and the
 * secrets of the webhooks. Parsed once and validated up front so a misconfigured deploy fails at
 * `next build` / `next start` / `next dev` (via `next.config.ts`) with a readable message instead
 * of rendering empty pages later.
 *
 * Only relative imports here: `next.config.ts` imports this file before path aliases exist.
 */

export const DATA_SOURCES = ["static", "laravel"] as const;
export type DataSource = (typeof DATA_SOURCES)[number];

/** `KEY=` in a .env file is "unset", not "the empty string". */
const blank = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalUrl = z.preprocess(blank, z.url({ protocol: /^https?$/ }).optional());
const optionalSecret = z.preprocess(blank, z.string().trim().optional());

const serverEnvSchema = z
  .object({
    DATA_SOURCE: z.preprocess(blank, z.enum(DATA_SOURCES).default("static")),
    /** Base URL of the REST API including its prefix, e.g. `https://cms.katicdesigns.com/api/v1`. */
    LARAVEL_API_URL: optionalUrl,
    /** Sanctum personal access token (read-only abilities) sent as `Authorization: Bearer`. */
    LARAVEL_API_TOKEN: optionalSecret,
    /** Origin (and optional path prefix) media files are served from, when not the API's origin. */
    LARAVEL_MEDIA_URL: optionalUrl,
    /** Per-request timeout for content reads. */
    LARAVEL_API_TIMEOUT_MS: z.preprocess(
      blank,
      z.coerce.number().int().min(500).max(60_000).default(8_000),
    ),
    /** Shared secret of POST /api/revalidate (HMAC-SHA256 key). */
    REVALIDATE_SECRET: z.preprocess(
      blank,
      z.string().min(16, "must be at least 16 characters").optional(),
    ),
    /** Lead intake endpoint (normally `${LARAVEL_API_URL}/leads`). */
    LEADS_ENDPOINT: optionalUrl,
    /** Token sent to LEADS_ENDPOINT as `Authorization: Bearer` (write-only `leads:create`). */
    LEADS_API_TOKEN: optionalSecret,
  })
  .superRefine((env, ctx) => {
    if (env.DATA_SOURCE !== "laravel") return;
    const required = ["LARAVEL_API_URL", "LARAVEL_API_TOKEN", "REVALIDATE_SECRET"] as const;
    for (const key of required) {
      if (env[key] === undefined) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "is required when DATA_SOURCE=laravel",
        });
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class ServerEnvError extends Error {
  override readonly name = "ServerEnvError";
}

type EnvSource = Readonly<Record<string, string | undefined>>;

/** Parses the environment; throws a `ServerEnvError` listing every problem at once. */
export function parseServerEnv(source: EnvSource): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);
  if (parsed.success) return parsed.data;
  const lines = parsed.error.issues.map(
    (issue) => `  - ${issue.path.join(".") || "(env)"}: ${issue.message}`,
  );
  throw new ServerEnvError(
    [
      "Invalid server environment (see .env.example):",
      ...lines,
      "Set DATA_SOURCE=static to build from the content in src/content instead.",
    ].join("\n"),
  );
}

let cached: ServerEnv | undefined;

/** The validated `process.env`, parsed on first use. */
export function serverEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/**
 * `next/image` remote pattern for the media host: `LARAVEL_MEDIA_URL` (origin + path prefix) or
 * the origin of `LARAVEL_API_URL`. `undefined` in static mode.
 */
export function mediaRemotePattern(env: ServerEnv):
  | {
      pattern: { protocol: "http" | "https"; hostname: string; port: string; pathname: string };
      loopback: boolean;
    }
  | undefined {
  if (env.DATA_SOURCE !== "laravel") return undefined;
  const base = env.LARAVEL_MEDIA_URL ?? env.LARAVEL_API_URL;
  if (!base) return undefined;
  const url = new URL(base);
  const prefix = env.LARAVEL_MEDIA_URL ? url.pathname.replace(/\/+$/, "") : "";
  return {
    pattern: {
      protocol: url.protocol === "http:" ? "http" : "https",
      hostname: url.hostname,
      port: url.port,
      pathname: `${prefix}/**`,
    },
    loopback: LOOPBACK_HOSTS.has(url.hostname),
  };
}
