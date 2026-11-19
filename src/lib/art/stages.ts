/**
 * The seven isometric stage drawings (original `KATIC_ART`, docs/analysis/01 E23): a house that
 * builds up from an empty ground plane (0) to the finished home with lit windows (6). Used by the
 * home "Seven stages" strip and every `.ksteps` process block.
 */
import { type ArtDrawing, type ArtPath, createIso, type Part, type Vec3 } from "./iso";

const { P, L, rect, box, hip, plane } = createIso({ unit: 28, origin: [146, 128] });

export const STAGE_COUNT = 7;
export type StageIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** The house footprint: x, y, z, w, d, h. */
const BX = [-3, -2.2, 0, 6, 4.4, 2.2] as const;
const roof = () => hip(-3, -2.2, 2.2, 6, 4.4, 1.1);
/** Window outline in the front wall (y = 2.2). */
const win = (x: number, z: number, w: number, h: number) =>
  L([
    [x, 2.2, z],
    [x + w, 2.2, z],
    [x + w, 2.2, z + h],
    [x, 2.2, z + h],
    [x, 2.2, z],
  ]);
const frame = (): Part[] => {
  const o: Part[] = [];
  for (const x of [-1, 1])
    o.push(
      L([
        [x, -2.2, 0],
        [x, -2.2, 2.2],
      ]),
      L([
        [x, 2.2, 0],
        [x, 2.2, 2.2],
      ]),
      L([
        [x, -2.2, 2.2],
        [x, 2.2, 2.2],
      ]),
    );
  o.push(
    L([
      [-3, 2.2, 1.2],
      [3, 2.2, 1.2],
    ]),
    L([
      [3, -2.2, 1.2],
      [3, 2.2, 1.2],
    ]),
  );
  return o;
};
const cols = (): Part[] => {
  const o: Part[] = [];
  for (const x of [-3, -1, 1, 3])
    for (const y of [-2.2, 2.2])
      o.push(
        L([
          [x, y, 0],
          [x, y, 2.2],
        ]),
      );
  for (const z of [1.2, 2.2]) o.push(rect(-3, -2.2, z, 6, 4.4));
  return o;
};

type Stage = {
  /** Solid lines (`.ln`). */
  readonly l: readonly Part[];
  /** Dashed construction lines (`.ln.dsh`). */
  readonly d?: readonly Part[];
  /** Two lit front windows (`.lit`). */
  readonly lit?: true;
};

const A: readonly Stage[] = [
  { l: [...plane(5)] },
  { l: [...plane(5), rect(-3, -2.2, 0, 6, 4.4)] },
  { l: [...plane(5), ...box(...BX), ...roof()] },
  { l: [...plane(5), ...box(...BX), ...roof(), ...frame()] },
  {
    l: [
      ...plane(5),
      ...cols(),
      L([
        [-3.8, 2.9, 0],
        [-3.8, 2.9, 3.2],
      ]),
      L([
        [3.8, 2.9, 0],
        [3.8, 2.9, 3.2],
      ]),
      L([
        [-3.8, 2.9, 1.2],
        [3.8, 2.9, 1.2],
      ]),
      L([
        [-3.8, 2.9, 2.4],
        [3.8, 2.9, 2.4],
      ]),
      L([
        [4.2, -3, 0],
        [4.2, -3, 5.4],
      ]),
      L([
        [4.2, -3, 5.4],
        [-0.5, -3, 5.4],
      ]),
      L([
        [0.4, -3, 5.4],
        [0.4, -3, 4.2],
      ]),
    ],
    d: [...roof()],
  },
  {
    l: [
      ...plane(5),
      ...box(...BX),
      ...roof(),
      L([
        [0, -2.2, 0],
        [0, 2.2, 0],
        [0, 2.2, 2.4],
      ]),
      L([
        [0, 0.6, 0],
        [3, 0.6, 0],
      ]),
      ...box(-2.4, 0.4, 0, 1.8, 1.2, 0.5),
      ...box(1, -1.6, 0, 1.4, 0.9, 0.8),
    ],
  },
  {
    l: [
      ...plane(5),
      ...box(...BX),
      ...roof(),
      win(-2.2, 0.7, 1.4, 1.1),
      win(0.8, 0.7, 1.4, 1.1),
      L([
        [-0.4, 2.2, 0],
        [-0.4, 2.2, 1.6],
        [0.4, 2.2, 1.6],
        [0.4, 2.2, 0],
      ]),
      L([
        [-0.4, 2.2, 0],
        [-0.6, 5, 0],
      ]),
      L([
        [0.4, 2.2, 0],
        [0.6, 5, 0],
      ]),
    ],
    lit: true,
  },
];

/** Lit window polygon `points` (unrounded, exactly as the original printed them). */
const litWindow = (x: number, z: number, w: number, h: number) =>
  (
    [
      [x, 2.2, z],
      [x + w, 2.2, z],
      [x + w, 2.2, z + h],
      [x, 2.2, z + h],
    ] as const satisfies readonly Vec3[]
  )
    .map((p) => P(...p).join(","))
    .join(" ");

/** Clamps any number to a valid stage, like the original `KATIC_ART(i)`. */
export function toStageIndex(i: number): StageIndex {
  return Math.max(0, Math.min(STAGE_COUNT - 1, Math.trunc(i) || 0)) as StageIndex;
}

/** The drawing for a stage (viewBox `0 0 292 200`, sliced to fill its box). */
export function stageArt(index: number): ArtDrawing {
  const a = A[toStageIndex(index)] ?? { l: [] };
  const paths: ArtPath[] = [
    ...a.l.map((d) => ({ d, dashed: false })),
    ...(a.d ?? []).map((d) => ({ d, dashed: true })),
  ];
  return {
    viewBox: "0 0 292 200",
    preserveAspectRatio: "xMidYMid slice",
    lit: a.lit ? [litWindow(-2.2, 0.7, 1.4, 1.1), litWindow(0.8, 0.7, 1.4, 1.1)] : [],
    paths,
  };
}

/* ---------- step title → stage picker (original `.ksteps` handler) ---------- */

const KW: readonly (readonly [StageIndex, RegExp])[] = [
  [
    0,
    /discover|understand|assess|brief|consult|opportunit|survey|coordination|material selection/i,
  ],
  [1, /concept|plan|feasib|schedul|mobilis|communication|precision/i],
  [2, /^design|develop|progress|assembly/i],
  [3, /engineer|document|milestone|finishing$/i],
  [4, /construct|execut|build|manufactur|repair|quality|site/i],
  [5, /interior|complet|finish|inspection/i],
  [6, /handover|support|aftercare|follow|deliver|ongoing|responsib|complete/i],
];

/**
 * Stage drawing for step `i` of `n` in a process row. A keyword match on the title wins unless it
 * is more than two stages away from the step's proportional position `round(i·6/(n−1))`.
 * `title` is the h3's plain text (the original used `textContent`).
 */
export function pickStage(title: string, i: number, n: number): StageIndex {
  let k: StageIndex | null = null;
  for (const [ix, re] of KW) {
    if (re.test(title)) {
      k = ix;
      break;
    }
  }
  const prog = toStageIndex(n > 1 ? Math.round((i * 6) / (n - 1)) : 0);
  if (k === null || Math.abs(k - prog) > 2) k = prog;
  return k;
}

/** Stage drawings for a whole process row, in step order. */
export function pickStages(titles: readonly string[]): StageIndex[] {
  return titles.map((t, i) => pickStage(t, i, titles.length));
}
