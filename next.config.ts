import type { NextConfig } from "next";

import { mediaRemotePattern, parseServerEnv } from "./src/lib/env/server-env";

const CSS_MODULE = /\.module\.css$/;

// Fail fast (build, start and dev all load this file): DATA_SOURCE=laravel without its API URL,
// token or revalidation secret stops here with a list of what is missing (Phase 11).
const env = parseServerEnv(process.env);
const media = mediaRemotePattern(env);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    // Laravel's media library (DATA_SOURCE=laravel): only its host and path prefix are optimised.
    remotePatterns: media ? [media.pattern] : [],
    // The local mock API (`pnpm mock:laravel`) serves media from 127.0.0.1, which the optimizer
    // refuses by default (SSRF guard). Allowed only when the configured media host is loopback.
    ...(media?.loopback ? { dangerouslyAllowLocalIP: true } : {}),
  },
  turbopack: {
    rules: {
      // Tailwind runs on every stylesheet; CSS Modules must keep their module type (`as`), or they
      // compile as global CSS without exported class names.
      "*.css": [
        {
          condition: { not: { path: CSS_MODULE } },
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
        {
          condition: { path: CSS_MODULE },
          loaders: ["@tailwindcss/turbopack"],
          as: "*.module.css",
        },
      ],
    },
  },
};

export default nextConfig;
