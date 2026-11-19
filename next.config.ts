import type { NextConfig } from "next";

const CSS_MODULE = /\.module\.css$/;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
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
