import { fileURLToPath } from "node:url";

/** `src/assets/images/` (absolute, with a trailing separator): the mock's media library. */
export const ASSETS_ROOT = fileURLToPath(new URL("../../src/assets/images/", import.meta.url));

/** Width and height from a WebP header (lossy `VP8 `, lossless `VP8L` or extended `VP8X`). */
export function readWebpSize(bytes: Buffer): { width: number; height: number } {
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("not a WebP file");
  }
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  }
  if (chunk === "VP8L") {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8 ") {
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  throw new Error(`unsupported WebP chunk ${chunk}`);
}
