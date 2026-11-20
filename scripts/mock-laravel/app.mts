import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, normalize, sep } from "node:path";

import { resolveResource } from "./resources.mjs";
import { ASSETS_ROOT } from "./webp.mjs";

export const API_PREFIX = "/api/v1";

type LeadMode = 201 | 422 | 429 | 500 | "timeout";
const LEAD_MODES: readonly unknown[] = [201, 422, 429, 500, "timeout"];
type RecordedLead = { idempotencyKey: string | null; receivedAt: string; body: unknown };

const MEDIA_TYPES: Readonly<Record<string, string>> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

/** In-memory state of one mock instance. */
type State = {
  leads: RecordedLead[];
  leadIds: Map<string, number>;
  leadMode: LeadMode;
  overrides: Map<string, unknown>;
};

/** What a handler answers: JSON, raw bytes, or nothing at all (a hung request). */
type Reply =
  | { status: number; json: unknown }
  | { status: number; bytes: Buffer; type: string }
  | { hang: true };

const reply = (status: number, json: unknown): Reply => ({ status, json });
const NOT_FOUND = reply(404, { message: "Not found." });

function write(res: ServerResponse, result: Reply) {
  if ("hang" in result) return; // never answers: the site's timeout and retry kick in
  if ("bytes" in result) {
    res.writeHead(result.status, {
      "content-type": result.type,
      "content-length": result.bytes.length,
      "cache-control": "public, max-age=31536000, immutable",
    });
    res.end(result.bytes);
    return;
  }
  const text = JSON.stringify(result.json);
  res.writeHead(result.status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(text),
  });
  res.end(text);
}

async function readJson(
  req: IncomingMessage,
): Promise<{ ok: true; value: unknown } | { ok: false }> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  try {
    return { ok: true, value: JSON.parse(Buffer.concat(chunks).toString("utf8")) };
  } catch {
    return { ok: false };
  }
}

function authorised(req: IncomingMessage, token: string | undefined) {
  return !token || req.headers.authorization === `Bearer ${token}`;
}

async function media(path: string): Promise<Reply> {
  const relative = normalize(decodeURIComponent(path.slice("/media/".length)));
  const type = MEDIA_TYPES[extname(relative)];
  if (relative.startsWith("..") || relative.includes(`${sep}..`) || !type) return NOT_FOUND;
  try {
    return { status: 200, bytes: await readFile(`${ASSETS_ROOT}${relative}`), type };
  } catch {
    return NOT_FOUND;
  }
}

async function lead(req: IncomingMessage, state: State): Promise<Reply> {
  if (!authorised(req, process.env["MOCK_LEADS_TOKEN"])) {
    return reply(401, { message: "Unauthenticated." });
  }
  const parsed = await readJson(req);
  if (!parsed.ok) return reply(400, { message: "Malformed JSON." });

  switch (state.leadMode) {
    case "timeout":
      return { hang: true };
    case 422:
      return reply(422, {
        message: "The email field must be a valid email address.",
        errors: { email: ["The email field must be a valid email address."] },
      });
    case 429:
      return reply(429, { message: "Too Many Attempts." });
    case 500:
      return reply(500, { message: "Server Error" });
    case 201:
      break;
  }

  const header = req.headers["idempotency-key"];
  const key = typeof header === "string" ? header : null;
  const existing = key ? state.leadIds.get(key) : undefined;
  if (existing !== undefined) {
    return reply(200, { data: { id: existing, status: "received", replayed: true } });
  }
  state.leads.push({
    idempotencyKey: key,
    receivedAt: new Date().toISOString(),
    body: parsed.value,
  });
  const id = state.leads.length;
  if (key) state.leadIds.set(key, id);
  return reply(201, { data: { id, status: "received" } });
}

async function control(req: IncomingMessage, url: URL, state: State): Promise<Reply> {
  switch (`${req.method ?? "GET"} ${url.pathname}`) {
    case "GET /__mock/health":
      return reply(200, { ok: true });
    case "GET /__mock/leads":
      return reply(200, { data: state.leads, mode: state.leadMode });
    case "DELETE /__mock/leads":
      state.leads = [];
      state.leadIds.clear();
      state.leadMode = 201;
      return reply(200, { ok: true });
    case "PUT /__mock/leads/mode": {
      const parsed = await readJson(req);
      const status = parsed.ok ? (parsed.value as { status?: unknown }).status : undefined;
      if (!LEAD_MODES.includes(status)) {
        return reply(400, { message: 'status must be 201, 422, 429, 500 or "timeout"' });
      }
      state.leadMode = status as LeadMode;
      return reply(200, { ok: true, mode: status });
    }
    case "PUT /__mock/override": {
      const path = url.searchParams.get("path");
      const parsed = await readJson(req);
      if (!path || !parsed.ok) return reply(400, { message: "?path= and a JSON body required" });
      state.overrides.set(path, parsed.value);
      return reply(200, { ok: true, path });
    }
    case "DELETE /__mock/override":
      state.overrides.clear();
      return reply(200, { ok: true });
    default:
      return NOT_FOUND;
  }
}

async function route(req: IncomingMessage, url: URL, state: State, origin: string) {
  const method = req.method ?? "GET";
  if (url.pathname.startsWith("/__mock/")) return control(req, url, state);
  if (method === "GET" && url.pathname.startsWith("/media/")) return media(url.pathname);
  if (method === "POST" && url.pathname === `${API_PREFIX}/leads`) return lead(req, state);
  if (method !== "GET" || !url.pathname.startsWith(`${API_PREFIX}/`)) return NOT_FOUND;
  if (!authorised(req, process.env["MOCK_LARAVEL_TOKEN"])) {
    return reply(401, { message: "Unauthenticated." });
  }
  if (state.overrides.has(url.pathname)) return reply(200, state.overrides.get(url.pathname));
  const resource = await resolveResource(url.pathname.slice(API_PREFIX.length), {
    query: url.searchParams,
    mediaOrigin: origin,
  });
  return resource === undefined ? NOT_FOUND : reply(200, resource);
}

/** Starts the mock on `host:port`; resolves once it listens. */
export async function startMockLaravel({ port, host }: { port: number; host: string }) {
  const state: State = { leads: [], leadIds: new Map(), leadMode: 201, overrides: new Map() };
  const origin = `http://${host}:${port}`;

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", origin);
    route(req, url, state, origin)
      .then((result) => {
        write(res, result);
      })
      .catch((error: unknown) => {
        console.error("[mock-laravel]", error);
        write(res, reply(500, { message: "Server Error" }));
      });
  });

  await new Promise<void>((resolve) => server.listen(port, host, resolve));
  return {
    url: origin,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => {
          resolve();
        });
      }),
  };
}
