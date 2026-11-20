import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Next resolves `server-only` itself (no package); in unit tests it is a no-op.
      "server-only": "next/dist/compiled/server-only/empty.js",
    },
  },
  test: {
    include: [
      "src/**/*.test.{ts,tsx}",
      "scripts/**/*.test.ts",
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/visual/**/*.test.ts",
    ],
    environment: "node",
    restoreMocks: true,
  },
});
