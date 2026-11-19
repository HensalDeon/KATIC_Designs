/**
 * Isometric projection and line primitives shared by the stage drawings and the feature icons
 * (original `KATIC_ART` / `KATIC_ICON`, docs/analysis/01 E23–E24).
 *
 * Every helper is a literal port: the operations (and their order) match the original so the
 * floating-point results, and therefore the `d` strings, are byte-identical. Do not "simplify" an
 * expression here without re-running `src/lib/art/art.test.ts`.
 */

/** A point in model space: x to the right-front, y to the left-front, z up (model units). */
export type Vec3 = readonly [number, number, number];

/**
 * A drawing part as produced by the generators: an SVG path `d` string, prefixed with `D` when it
 * is a dashed construction line (the original's convention, kept so the port stays line-by-line
 * comparable with the source).
 */
export type Part = string;

/** One `<path class="ln[ dsh]" pathLength="1">` of a drawing. */
export type ArtPath = {
  readonly d: string;
  /** Dashed construction line (`.ln.dsh`): fades in after the solid lines have drawn. */
  readonly dashed: boolean;
};

/** A complete drawing, ready to render as an `<svg>`. */
export type ArtDrawing = {
  readonly viewBox: string;
  readonly preserveAspectRatio: string;
  /** `points` of the lit window polygons (`.lit`), drawn below the lines. Stages only. */
  readonly lit: readonly string[];
  readonly paths: readonly ArtPath[];
};

type Projection = {
  /** Model unit in px. */
  readonly unit: number;
  /** Screen position of the model origin. */
  readonly origin: readonly [number, number];
};

const EX = [0.968, 0.252] as const;
const EY = [-0.977, 0.215] as const;
const ZK = 0.95;

/** Marks a part as a dashed construction line. */
export const dashed = (d: string): Part => "D" + d;

/** Builds the projection `P`, the polyline `L` and the solid primitives for one drawing scale. */
export function createIso({ unit: U, origin: C0 }: Projection) {
  const P = (x: number, y: number, z: number): [number, number] => [
    C0[0] + x * U * EX[0] + y * U * EY[0],
    C0[1] + x * U * EX[1] + y * U * EY[1] - z * U * ZK,
  ];
  const f = (v: number) => v.toFixed(1);
  /** Open polyline through the points. */
  const L = (pts: readonly Vec3[]): Part =>
    "M" +
    pts
      .map((p) =>
        P(...p)
          .map(f)
          .join(","),
      )
      .join("L");
  /** Closed polygon (repeats the first point). */
  const Z = (pts: readonly Vec3[]): Part => {
    const first = pts[0];
    return L(first ? [...pts, first] : pts);
  };
  /** Horizontal rectangle at height z. */
  const rect = (x: number, y: number, z: number, w: number, d: number): Part =>
    Z([
      [x, y, z],
      [x + w, y, z],
      [x + w, y + d, z],
      [x, y + d, z],
    ]);
  /** Box outline: bottom, top and the four vertical edges. */
  const box = (x: number, y: number, z: number, w: number, d: number, h: number): Part[] => {
    const v: Vec3[] = [
      [x, y, z],
      [x + w, y, z],
      [x + w, y + d, z],
      [x, y + d, z],
    ];
    const t = v.map(([a, b, c]): Vec3 => [a, b, c + h]);
    return [Z(v), Z(t), ...v.map((p, i) => L([p, t[i] ?? p]))];
  };
  /** Hip roof: ridge between 30% and 70% of the width, four hips down to the eaves. */
  const hip = (x: number, y: number, z: number, w: number, d: number, h: number): Part[] => {
    const a: Vec3 = [x + w * 0.3, y + d / 2, z + h];
    const b: Vec3 = [x + w * 0.7, y + d / 2, z + h];
    return [
      L([a, b]),
      L([[x, y, z], a]),
      L([[x, y + d, z], a]),
      L([[x + w, y, z], b]),
      L([[x + w, y + d, z], b]),
    ];
  };
  /** Square ground plane of half-size s. */
  const plane = (s: number): Part[] => [rect(-s, -s, 0, 2 * s, 2 * s)];

  return { P, L, Z, rect, box, hip, plane };
}

/** Splits generator parts into rendered paths exactly like the original `draw()`. */
export function toPaths(parts: readonly Part[]): ArtPath[] {
  const out: ArtPath[] = [];
  for (const part of parts) {
    if (!part) continue;
    const isDashed = part.startsWith("D");
    const d = isDashed ? part.slice(1) : part;
    for (const seg of d.split(/(?=M)/)) {
      if (seg.trim()) out.push({ d: seg, dashed: isDashed });
    }
  }
  return out;
}
