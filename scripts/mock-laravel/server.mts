/**
 * Mock Laravel API for development and e2e (Phase 11): serves the static content in src/content
 * as the REST resources of docs/API_CONTRACT.md, the media files, and `POST /leads`, so the site
 * can run with DATA_SOURCE=laravel without a backend.
 *
 *   pnpm mock:laravel                       # http://127.0.0.1:3651/api/v1
 *   MOCK_LARAVEL_PORT=4000 pnpm mock:laravel
 *
 * Auth: when MOCK_LARAVEL_TOKEN is set, content requests need `Authorization: Bearer <it>`; when
 * MOCK_LEADS_TOKEN is set, so does POST /leads. Unset = any token is accepted.
 *
 * Test controls (not part of the contract) live under /__mock:
 *   GET    /__mock/health
 *   GET    /__mock/leads                      → leads received so far
 *   DELETE /__mock/leads                      → forget them
 *   PUT    /__mock/leads/mode {"status":500}  → answer the next leads with 500 / 422 / 429 /
 *                                              "timeout" (never answers) / 201 (default)
 *   PUT    /__mock/override?path=/api/v1/…    → serve the JSON body for that path instead
 *   DELETE /__mock/override                   → drop all overrides
 */
import { register } from "node:module";

import { installAssetRequireHook } from "./asset-hooks.mjs";

// Content modules import .webp files; both hooks must be in place before they load.
installAssetRequireHook();
register(new URL("./asset-hooks.mjs", import.meta.url));

const { startMockLaravel } = await import("./app.mjs");

const port = Number(process.env["MOCK_LARAVEL_PORT"] ?? "3651");
const host = process.env["MOCK_LARAVEL_HOST"] ?? "127.0.0.1";
const server = await startMockLaravel({ port, host });
console.log(`[mock-laravel] listening on ${server.url}/api/v1`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void server.close().then(() => process.exit(0));
  });
}
