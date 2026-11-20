import type { z } from "zod";

/**
 * The HTTP boundary to the Laravel REST API (docs/API_CONTRACT.md): bearer token, per-request
 * timeout, one retry for transient failures, the `{ "data": … }` envelope and Zod parsing, with a
 * typed error for each way a read can fail. Caching is the caller's job (`"use cache"` scopes in
 * `laravel-repository.ts`), so nothing here touches Next's caches.
 */

export type LaravelErrorKind = "network" | "timeout" | "http" | "schema";

export class LaravelApiError extends Error {
  override readonly name: string = "LaravelApiError";
  constructor(
    readonly kind: LaravelErrorKind,
    readonly path: string,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(`[laravel] GET ${path}: ${message}`, options);
  }
}

/** The request never got an answer (DNS, refused connection, reset) or timed out. */
export class LaravelNetworkError extends LaravelApiError {
  override readonly name = "LaravelNetworkError";
  constructor(path: string, timedOut: boolean, cause: unknown) {
    super(timedOut ? "timeout" : "network", path, timedOut ? "timed out" : "unreachable", {
      cause,
    });
  }
}

/** The API answered with a non-2xx status (404 is reported separately, see `allowNotFound`). */
export class LaravelHttpError extends LaravelApiError {
  override readonly name = "LaravelHttpError";
  constructor(
    path: string,
    readonly status: number,
    readonly body: string,
  ) {
    super("http", path, `HTTP ${status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
}

/** The API answered 2xx with a body that does not match the contract. */
export class LaravelSchemaError extends LaravelApiError {
  override readonly name = "LaravelSchemaError";
  constructor(
    path: string,
    readonly issues: readonly string[],
  ) {
    super("schema", path, `response does not match the contract:\n  ${issues.join("\n  ")}`);
  }
}

export type LaravelClientConfig = {
  /** Base URL including the version prefix, without a trailing slash. */
  baseUrl: string;
  token: string;
  timeoutMs: number;
  fetchImpl?: typeof fetch;
};

const ATTEMPTS = 2;

/** `GET {baseUrl}{path}` → `schema.parse(body.data)`. `null` on 404 when `allowNotFound`. */
export async function laravelGet<S extends z.ZodType>(
  config: LaravelClientConfig,
  path: string,
  schema: S,
  options: { allowNotFound: true },
): Promise<z.output<S> | null>;
export async function laravelGet<S extends z.ZodType>(
  config: LaravelClientConfig,
  path: string,
  schema: S,
  options?: { allowNotFound?: false },
): Promise<z.output<S>>;
export async function laravelGet<S extends z.ZodType>(
  config: LaravelClientConfig,
  path: string,
  schema: S,
  { allowNotFound = false }: { allowNotFound?: boolean } = {},
): Promise<z.output<S> | null> {
  const fetchImpl = config.fetchImpl ?? fetch;
  const url = `${config.baseUrl.replace(/\/+$/, "")}${path}`;
  let lastError: LaravelApiError | undefined;

  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    let response: Response;
    try {
      response = await fetchImpl(url, {
        headers: { Accept: "application/json", Authorization: `Bearer ${config.token}` },
        signal: AbortSignal.timeout(config.timeoutMs),
        // The "use cache" scope around the read is the cache; never a second, untagged one.
        cache: "no-store",
      });
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "TimeoutError";
      lastError = new LaravelNetworkError(path, timedOut, error);
      continue;
    }

    if (response.status === 404 && allowNotFound) return null;
    if (!response.ok) {
      lastError = new LaravelHttpError(
        path,
        response.status,
        await response.text().catch(() => ""),
      );
      if (response.status >= 500) continue;
      throw lastError;
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new LaravelSchemaError(path, ["body is not JSON"]);
    }
    if (typeof body !== "object" || body === null || !("data" in body)) {
      throw new LaravelSchemaError(path, ['missing the "data" envelope']);
    }
    const parsed = schema.safeParse(body.data);
    if (!parsed.success) {
      throw new LaravelSchemaError(
        path,
        parsed.error.issues
          .slice(0, 10)
          .map((issue) => `data.${issue.path.join(".")}: ${issue.message}`),
      );
    }
    return parsed.data;
  }

  throw lastError ?? new LaravelNetworkError(path, false, undefined);
}
