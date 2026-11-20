import { cva } from "class-variance-authority";

/**
 * The grid (`.kc-grid.cN`): N columns on the canvas, two below 1100px, one on phones. Its own module
 * so client islands (India's filtered grid) can use it without importing `CardGrid`, which resolves
 * media server-side (P10-03).
 */
export const cardGridVariants = cva("grid gap-24 max-lg:grid-cols-2 max-md:grid-cols-1", {
  variants: {
    columns: {
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
    },
  },
});
