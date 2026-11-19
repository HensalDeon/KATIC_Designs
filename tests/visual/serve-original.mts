/**
 * Minimal static server for the original single-file site (reference/original/).
 * Used by the baseline capture; can also be run on its own to browse the original:
 *   pnpm ref:serve        → http://localhost:4310/
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ORIGINAL_DIR = path.join(process.cwd(), "reference/original");
const ENTRY = "katic-designs-final.html";

/**
 * The original references its hero videos as `katic-banner-*.mp4` (files never shipped with the
 * HTML); we serve the extracted copies so the page doesn't fall back through a 404.
 */
const ALIASES: Readonly<Record<string, string>> = {
  "/": ENTRY,
  "/katic-banner-desktop.mp4": "assets/kv-desktop.mp4",
  "/katic-banner-mobile.mp4": "assets/kv-mobile.mp4",
};

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".mp4": "video/mp4",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

/** Starts the server on `port` (`0` = any free port; the returned `url` has the real one). */
export async function startOriginalServer(
  port = 4310,
): Promise<{ url: string; close: () => Promise<void> }> {
  await stat(path.join(ORIGINAL_DIR, ENTRY)).catch(() => {
    throw new Error(`Missing reference/original/${ENTRY}. See docs/MIGRATION_PLAN.md (Phase 0).`);
  });

  const server: Server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
    const relative = ALIASES[pathname] ?? pathname.replace(/^\/+/, "");
    const file = path.resolve(ORIGINAL_DIR, relative);

    // Never serve anything outside the reference folder.
    if (!file.startsWith(ORIGINAL_DIR + path.sep)) {
      res.writeHead(403).end();
      return;
    }

    stat(file)
      .then((info) => {
        if (!info.isFile()) throw new Error("not a file");
        res.writeHead(200, {
          "Content-Type": CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
          "Content-Length": info.size,
        });
        createReadStream(file).pipe(res);
      })
      .catch(() => res.writeHead(404).end());
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  return {
    url: `http://127.0.0.1:${actualPort}/`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

// Run directly: keep serving until interrupted.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const { url } = await startOriginalServer();
  console.log(`Original site: ${url}  (Ctrl+C to stop)`);
}
