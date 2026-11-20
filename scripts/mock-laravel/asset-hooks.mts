/**
 * Lets plain Node (via tsx) import the content modules, which import images the way the Next
 * bundler does (`import logo from "@/assets/images/brand/logo.webp"`).
 *
 * An image import becomes `{ src, width, height }` (like Next's `StaticImageData`), where `src` is
 * `/media/<path below src/assets/images>`, the path the mock serves the file at. Dimensions come
 * from the WebP header, so no image library is needed. The content files are CommonJS to tsx (the
 * package has no `"type": "module"`), so the hook is a `require` extension; `load` covers ESM.
 */
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { ASSETS_ROOT, readWebpSize } from "./webp.mjs";

function staticImage(path: string, bytes: Buffer) {
  const { width, height } = readWebpSize(bytes);
  const src = path.startsWith(ASSETS_ROOT)
    ? `/media/${path.slice(ASSETS_ROOT.length).replaceAll("\\", "/")}`
    : `/media/unknown/${path.split(/[\\/]/).pop() ?? ""}`;
  return { src, width, height };
}

type CjsModule = { exports: unknown };
type CjsLoader = (module: CjsModule, filename: string) => void;
// `require.extensions` is deprecated but still the only synchronous hook for CommonJS loading.
const { extensions } = createRequire(import.meta.url) as unknown as {
  extensions: Record<string, CjsLoader>;
};

/** Installs the `.webp` require extension (idempotent). */
export function installAssetRequireHook(): void {
  extensions[".webp"] = (module, filename) => {
    module.exports = { __esModule: true, default: staticImage(filename, readFileSync(filename)) };
  };
}

type LoadContext = { format?: string | null | undefined };
type LoadResult = { format: string; source: string; shortCircuit?: boolean };
type NextLoad = (url: string, context: LoadContext) => Promise<LoadResult>;

/** ESM loader hook (registered with `module.register`). */
export async function load(url: string, context: LoadContext, nextLoad: NextLoad) {
  if (!url.startsWith("file:") || !url.endsWith(".webp")) return nextLoad(url, context);
  const path = fileURLToPath(url);
  const image = staticImage(path, await readFile(path));
  return {
    format: "module",
    source: `export default ${JSON.stringify(image)};`,
    shortCircuit: true,
  } satisfies LoadResult;
}
