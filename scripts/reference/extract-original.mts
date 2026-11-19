/**
 * Rebuilds the git-ignored `reference/original/` folder from the original single-file site.
 *
 *   pnpm ref:extract              # use reference/original/katic-designs-final.html
 *   pnpm ref:extract --download   # fetch it from the staging URL first
 *   pnpm ref:extract --out <dir>  # write the stripped file and assets elsewhere
 *
 * Produces:
 *   katic-designs-final.stripped.html  the source with every base64 blob replaced by a short
 *                                      placeholder (the docs/analysis line numbers refer to it)
 *   assets/img-<key>.webp              images from window.KATIC_IMG
 *   assets/kv-<kind>.mp4               hero videos
 *   assets/inline-<n>.<ext>            other inline data URIs (fonts)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

const SOURCE_URL = "https://ateliertest.in/works/katic/katic-designs%20final.html";

const IMG_MAP_START = "window.KATIC_IMG=";
const IMG_MAP_END = ";window.KATIC_DIM=";

const { values: args } = parseArgs({
  options: {
    download: { type: "boolean", default: false },
    out: { type: "string", default: "reference/original" },
  },
});

const OUT_DIR = path.resolve(process.cwd(), args.out);
const ORIGINAL = path.join(process.cwd(), "reference/original/katic-designs-final.html");
const STRIPPED = path.join(OUT_DIR, "katic-designs-final.stripped.html");
const ASSETS = path.join(OUT_DIR, "assets");

await mkdir(ASSETS, { recursive: true });

if (args.download) {
  // The host's mod_security rejects requests that don't look like a browser.
  const response = await fetch(SOURCE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  await writeFile(ORIGINAL, Buffer.from(await response.arrayBuffer()));
  console.log(`Downloaded ${SOURCE_URL}`);
}

const html = await readFile(ORIGINAL, "utf8");

// 1. Image map → individual files, map body → list of keys.
const mapStart = html.indexOf(IMG_MAP_START) + IMG_MAP_START.length;
const mapEnd = html.indexOf(IMG_MAP_END, mapStart);
if (mapStart < IMG_MAP_START.length || mapEnd < 0) throw new Error("window.KATIC_IMG not found");
const images = JSON.parse(html.slice(mapStart, mapEnd)) as Record<string, string>;
for (const [key, dataUri] of Object.entries(images)) {
  const base64 = dataUri.slice(dataUri.indexOf(",") + 1);
  await writeFile(path.join(ASSETS, `img-${key}.webp`), Buffer.from(base64, "base64"));
}
// Keys in document order (Object.keys would hoist integer-like keys such as "1029896879").
const orderedKeys = [...html.slice(mapStart, mapEnd).matchAll(/"([^"]+)":"data:/g)].map((m) => m[1]);
let stripped = `${html.slice(0, mapStart)}{/*${orderedKeys.join(",")}*/}${html.slice(mapEnd)}`;

// 2. Embedded hero videos.
const videoPattern = /(<script type="text\/plain" id="([\w-]+)">)([\s\S]*?)(<\/script>)/g;
for (const match of stripped.matchAll(videoPattern)) {
  const [, , id = "", body = ""] = match;
  await writeFile(path.join(ASSETS, `${id}.mp4`), Buffer.from(body.replace(/\s/g, ""), "base64"));
}
stripped = stripped.replace(videoPattern, "$1[[VIDEO]]$4");

// 3. Remaining data URIs (fonts).
let inline = 0;
const writes: Promise<void>[] = [];
stripped = stripped.replace(/data:([\w/+.-]+);base64,([A-Za-z0-9+/=\s]+)/g, (_match, mime: string, body: string) => {
  inline += 1;
  const file = `inline-${inline}.${mime.split("/")[1] ?? "bin"}`;
  writes.push(writeFile(path.join(ASSETS, file), Buffer.from(body.replace(/\s/g, ""), "base64")));
  return `data:${mime};base64,[[${file}]]`;
});
await Promise.all(writes);

await writeFile(STRIPPED, stripped);
console.log(
  `Extracted ${Object.keys(images).length} images, ${inline} inline assets and hero videos into ${path.relative(process.cwd(), OUT_DIR)}`,
);
