/**
 * Feature-tile 3D line icons (original `window.KATIC_ICON`, docs/analysis/01 E24): ~50 isometric
 * drawings in the same language as the stage drawings, and the title → icon picker that keeps
 * icons unique within a grid.
 */
import { type ArtDrawing, createIso, dashed, type Part, toPaths, type Vec3 } from "./iso";

const { L, Z, rect, box, hip, plane } = createIso({ unit: 19, origin: [146, 112] });

/* ---------- local primitives (literal port of the original helpers) ---------- */

/** Vertical rectangle in the front plane (facing +y). */
const vrectX = (x: number, y: number, z: number, w: number, h: number) =>
  Z([
    [x, y, z],
    [x + w, y, z],
    [x + w, y, z + h],
    [x, y, z + h],
  ]);
/** Gable roof over a w × d footprint, ridge along x. */
const gable = (x: number, y: number, z: number, w: number, d: number, h: number): Part[] => {
  const a: Vec3 = [x, y + d / 2, z + h];
  const b: Vec3 = [x + w, y + d / 2, z + h];
  return [L([[x, y, z], a, [x, y + d, z]]), L([[x + w, y, z], b, [x + w, y + d, z]]), L([a, b])];
};
/** Horizontal circle. */
const circ = (cx: number, cy: number, z: number, r: number, n = 28) => {
  const p: Vec3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    p.push([cx + r * Math.cos(t), cy + r * Math.sin(t), z]);
  }
  return L(p);
};
/** Horizontal arc from a0 to a1 (radians). */
const arcG = (cx: number, cy: number, z: number, r: number, a0: number, a1: number, n = 18) => {
  const p: Vec3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = a0 + ((a1 - a0) * i) / n;
    p.push([cx + r * Math.cos(t), cy + r * Math.sin(t), z]);
  }
  return L(p);
};
/** Circle in the front plane. */
const vcirc = (cx: number, cy: number, cz: number, r: number, n = 24) => {
  const p: Vec3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    p.push([cx + r * Math.cos(t), cy, cz + r * Math.sin(t)]);
  }
  return L(p);
};
const cyl = (cx: number, cy: number, z: number, r: number, h: number): Part[] => {
  const k = 0.707;
  return [
    circ(cx, cy, z, r),
    circ(cx, cy, z + h, r),
    L([
      [cx + r * k, cy - r * k, z],
      [cx + r * k, cy - r * k, z + h],
    ]),
    L([
      [cx - r * k, cy + r * k, z],
      [cx - r * k, cy + r * k, z + h],
    ]),
  ];
};
const person = (x: number, y: number): Part[] => [
  ...cyl(x, y, 0, 0.32, 1.15),
  circ(x, y, 1.55, 0.26, 16),
];
const arrowG = (x0: number, y0: number, x1: number, y1: number, z = 0): Part[] => {
  const dx = x1 - x0,
    dy = y1 - y0,
    l = Math.hypot(dx, dy),
    ux = dx / l,
    uy = dy / l,
    h = 0.45;
  return [
    L([
      [x0, y0, z],
      [x1, y1, z],
    ]),
    L([
      [x1 - ux * h - uy * h * 0.6, y1 - uy * h + ux * h * 0.6, z],
      [x1, y1, z],
      [x1 - ux * h + uy * h * 0.6, y1 - uy * h - ux * h * 0.6, z],
    ]),
  ];
};
const treeAt = (x: number, y: number, s = 1): Part[] => [
  L([
    [x, y, 0],
    [x, y, 1.1 * s],
  ]),
  ...(
    [
      [1.1, 0.9],
      [1.9, 0.7],
      [2.6, 0.45],
    ] as const
  ).map(([z, r]) => circ(x, y, z * s, r * s, 18)),
  L([
    [x + 0.9 * s, y, 0.9 * s],
    [x, y, 3.1 * s],
    [x - 0.9 * s, y, 0.9 * s],
  ]),
  L([
    [x, y + 0.9 * s, 0.9 * s],
    [x, y, 3.1 * s],
    [x, y - 0.9 * s, 0.9 * s],
  ]),
];
const chair = (x: number, y: number): Part[] => [
  ...box(x, y, 0.9, 1, 1, 0.12),
  L([
    [x, y, 0],
    [x, y, 0.9],
  ]),
  L([
    [x + 1, y, 0],
    [x + 1, y, 0.9],
  ]),
  L([
    [x + 1, y + 1, 0],
    [x + 1, y + 1, 0.9],
  ]),
  L([
    [x, y + 1, 0],
    [x, y + 1, 0.9],
  ]),
  vrectX(x, y + 1, 1, 1, 1),
];
const table = (x: number, y: number, w: number, d: number, h = 1.3): Part[] => [
  ...box(x, y, h, w, d, 0.12),
  L([
    [x + 0.1, y + 0.1, 0],
    [x + 0.1, y + 0.1, h],
  ]),
  L([
    [x + w - 0.1, y + 0.1, 0],
    [x + w - 0.1, y + 0.1, h],
  ]),
  L([
    [x + w - 0.1, y + d - 0.1, 0],
    [x + w - 0.1, y + d - 0.1, h],
  ]),
  L([
    [x + 0.1, y + d - 0.1, 0],
    [x + 0.1, y + d - 0.1, h],
  ]),
];
const corner = (): Part[] => [
  Z([
    [-3.4, -2.6, 0],
    [3, -2.6, 0],
    [3, 2.8, 0],
    [-3.4, 2.8, 0],
  ]),
  L([
    [-3.4, 2.8, 0],
    [-3.4, 2.8, 4],
    [3, 2.8, 4],
    [3, 2.8, 0],
  ]),
  L([
    [-3.4, -2.6, 0],
    [-3.4, -2.6, 4],
    [-3.4, 2.8, 4],
  ]),
];
const winX = (x: number, y: number, z: number, w: number, h: number): Part[] => [
  vrectX(x, y, z, w, h),
  L([
    [x + w / 2, y, z],
    [x + w / 2, y, z + h],
  ]),
  L([
    [x, y, z + h / 2],
    [x + w, y, z + h / 2],
  ]),
];
const houseAt = (x = -2.4, y = -1.8, w = 4.8, d = 3.6, h = 2.2): Part[] => [
  ...box(x, y, 0, w, d, h),
  ...gable(x, y, h, w, d, 1.5),
  vrectX(x + w * 0.42, y + d, 0, 0.9, 1.5),
  ...winX(x + 0.5, y + d, 0.9, 1, 0.9),
];
const pinAt = (x: number, y: number): Part[] => [
  circ(x, y, 0, 0.9, 20),
  circ(x, y, 0, 0.45, 16),
  L([
    [x, y, 0],
    [x - 0.75, y, 2.4],
  ]),
  L([
    [x, y, 0],
    [x + 0.75, y, 2.4],
  ]),
  vcirc(x, y, 2.9, 0.85),
  vcirc(x, y, 2.9, 0.32, 14),
];
const check = (x: number, y: number, z: number, s = 1) =>
  L([
    [x - 1.1 * s, y, z + 0.2 * s],
    [x - 0.35 * s, y, z - 0.55 * s],
    [x + 1.2 * s, y, z + 1.1 * s],
  ]);
const docAt = (x: number, y: number): Part[] => [
  vrectX(x, y, 0, 2.6, 3.4),
  ...[2.7, 2.1, 1.5, 0.9].map((z) =>
    L([
      [x + 0.9, y, z],
      [x + 2.2, y, z],
    ]),
  ),
  ...[2.7, 2.1, 1.5, 0.9].map((z) => rect(x + 0.3, y, z - 0.18, 0.36, 0.0001)),
];
const calendarAt = (x: number, y: number): Part[] => {
  const o = [
    vrectX(x, y, 0, 4, 3.4),
    L([
      [x, y, 2.7],
      [x + 4, y, 2.7],
    ]),
    L([
      [x + 0.8, y, 3.4],
      [x + 0.8, y, 3.8],
    ]),
    L([
      [x + 3.2, y, 3.4],
      [x + 3.2, y, 3.8],
    ]),
  ];
  for (let i = 1; i < 4; i++)
    o.push(
      L([
        [x + i, y, 0],
        [x + i, y, 2.7],
      ]),
    );
  for (const z of [0.9, 1.8])
    o.push(
      L([
        [x, y, z],
        [x + 4, y, z],
      ]),
    );
  return o;
};
const bars = (hs: readonly number[], x0 = -2.4, y = -0.6): Part[] =>
  hs.flatMap((h, i) => box(x0 + i * 1.5, y, 0, 1, 1.2, h));
const scaffoldAt = (x: number, y: number, w: number, h: number): Part[] => {
  const o: Part[] = [];
  for (let i = 0; i <= w; i += 1.2)
    o.push(
      L([
        [x + i, y, 0],
        [x + i, y, h],
      ]),
    );
  for (let z = 1.2; z <= h; z += 1.2)
    o.push(
      L([
        [x, y, z],
        [x + w, y, z],
      ]),
    );
  o.push(
    L([
      [x, y, 0],
      [x + 1.2, y, 1.2],
    ]),
    L([
      [x + 1.2, y, 1.2],
      [x + 2.4, y, 2.4],
    ]),
  );
  return o;
};
const floorplanAt = (moved: boolean): Part[] => {
  const o = [
    rect(-3.4, -2.6, 0, 6.8, 5.2),
    ...box(-3.4, -2.6, 0, 6.8, 0.01, 0.8),
    ...box(-3.4, -2.6, 0, 0.01, 5.2, 0.8),
    L([
      [-0.4, -2.6, 0],
      [-0.4, -2.6, 0.8],
      [-0.4, 0.6, 0.8],
      [-0.4, 0.6, 0],
    ]),
    L([
      [-3.4, 0.6, 0],
      [-3.4, 0.6, 0.8],
      [-1.6, 0.6, 0.8],
      [-1.6, 0.6, 0],
    ]),
    L([
      [0.8, 0.6, 0],
      [0.8, 0.6, 0.8],
      [3.4, 0.6, 0.8],
      [3.4, 0.6, 0],
    ]),
  ];
  if (moved)
    o.push(
      dashed(
        L([
          [1.6, -2.6, 0],
          [1.6, -2.6, 0.8],
          [1.6, 0.6, 0.8],
          [1.6, 0.6, 0],
        ]),
      ),
    );
  return o;
};
const sofa = (x: number, y: number): Part[] => [
  ...box(x, y, 0.5, 3.2, 1.4, 0.5),
  ...box(x, y, 0, 3.2, 1.4, 0.5),
  vrectX(x, y + 1.4, 0.5, 3.2, 1.2),
  ...box(x - 0.4, y, 0, 0.4, 1.4, 1.2),
  ...box(x + 3.2, y, 0, 0.4, 1.4, 1.2),
];
const lampAt = (x: number, y: number, z0 = 5): Part[] => [
  L([
    [x, y, z0],
    [x, y, 3.4],
  ]),
  L([
    [x - 0.9, y, 2.6],
    [x, y, 3.4],
    [x + 0.9, y, 2.6],
  ]),
  circ(x, y, 2.6, 0.9, 20),
  dashed(
    L([
      [x - 0.9, y, 2.6],
      [x - 2, y, 0],
    ]),
  ),
  dashed(
    L([
      [x + 0.9, y, 2.6],
      [x + 2, y, 0],
    ]),
  ),
  dashed(circ(x, y, 0, 2, 24)),
];
const toolsAt = (): Part[] => [
  ...box(-3, -1, 0, 4.2, 2, 1.6),
  L([
    [-1.6, 0, 1.6],
    [-1.6, 0, 2.4],
    [-0.2, 0, 2.4],
    [-0.2, 0, 1.6],
  ]),
  L([
    [-3, 1, 1],
    [1.2, 1, 1],
  ]),
  L([
    [1.8, 1.6, 0],
    [2.6, -0.4, 3.6],
  ]),
  ...box(2, -0.9, 3.4, 1.4, 0.7, 0.6),
  vcirc(3.2, 1.2, 1, 0.7, 16),
  vcirc(3.2, 1.2, 1, 0.35, 12),
];

/* ---------- the icons (original ARTS, same keys, same order) ---------- */

const house = () => houseAt();
const tower = (): Part[] => {
  const o = [...box(-1.6, -1.4, 0, 3.2, 2.8, 5.6)];
  for (let z = 0.8; z < 5.6; z += 0.8)
    o.push(
      L([
        [-1.6, 1.4, z],
        [1.6, 1.4, z],
        [1.6, -1.4, z],
      ]),
    );
  o.push(
    L([
      [0, 1.4, 0],
      [0, 1.4, 5.6],
    ]),
  );
  return o;
};
const civic = (): Part[] => {
  const o = [...box(-3, -1.8, 0, 6, 3.6, 0.4), ...box(-2.6, -1.4, 0.4, 5.2, 2.8, 2.4)];
  for (let x = -2.2; x <= 2.3; x += 1.1)
    o.push(
      L([
        [x, 1.4, 0.4],
        [x, 1.4, 2.8],
      ]),
    );
  o.push(
    L([
      [-2.9, 1.6, 2.8],
      [0, 1.6, 3.9],
      [2.9, 1.6, 2.8],
      [-2.9, 1.6, 2.8],
    ]),
    L([
      [0, 1.6, 3.9],
      [0, -1.4, 3.9],
    ]),
  );
  return o;
};
const hotel = (): Part[] => [
  ...box(-3, -1.6, 0, 3, 3.2, 4.6),
  ...box(0, -1.6, 0, 3.2, 3.2, 2),
  ...[1, 2, 3, 4].flatMap((z) => [
    L([
      [-3, 1.6, z],
      [0, 1.6, z],
    ]),
  ]),
  L([
    [0.4, 1.6, 2.6],
    [2.8, 1.6, 2.6],
  ]),
  L([
    [0.4, 1.6, 2],
    [0.4, 1.6, 2.6],
  ]),
  L([
    [2.8, 1.6, 2],
    [2.8, 1.6, 2.6],
  ]),
];
const frame = (): Part[] => {
  const o: Part[] = [];
  for (const x of [-2.6, 0, 2.6])
    for (const y of [-1.6, 1.6])
      o.push(
        L([
          [x, y, 0],
          [x, y, 3.6],
        ]),
      );
  for (const z of [1.8, 3.6]) {
    o.push(rect(-2.6, -1.6, z, 5.2, 3.2));
    o.push(
      L([
        [0, -1.6, z],
        [0, 1.6, z],
      ]),
    );
  }
  return o;
};
const network = (): Part[] => {
  const N = [
    [-2.6, -1.4],
    [2.4, -1.8],
    [0, 0],
    [-2, 2],
    [2.6, 1.8],
  ] as const;
  const o = N.flatMap(([x, y]) => cyl(x, y, 0, 0.42, 0.8));
  const edges = [
    [N[0], N[2]],
    [N[1], N[2]],
    [N[3], N[2]],
    [N[4], N[2]],
    [N[0], N[3]],
    [N[1], N[4]],
  ] as const;
  edges.forEach(([a, b]) =>
    o.push(
      L([
        [a[0], a[1], 0.8],
        [b[0], b[1], 0.8],
      ]),
    ),
  );
  return o;
};
const pipes = (): Part[] => [
  L([
    [-3, -1, 0.4],
    [0, -1, 0.4],
    [0, -1, 3],
    [2.6, -1, 3],
  ]),
  L([
    [-3, 1, 0.8],
    [1.4, 1, 0.8],
    [1.4, 1, 2.2],
    [1.4, -1.6, 2.2],
  ]),
  L([
    [-1.6, -2.4, 0],
    [-1.6, -2.4, 2.6],
    [-1.6, 1.6, 2.6],
  ]),
  circ(0, -1, 0.4, 0.32, 12),
  circ(1.4, 1, 0.8, 0.32, 12),
  circ(-1.6, -2.4, 2.6, 0.32, 12),
  ...box(1.8, -1.6, 2.6, 1.4, 1, 1.2),
];
const finish = (): Part[] => [
  vrectX(-3, 0, 0, 6, 4.4),
  vrectX(-3, 0.25, 0, 4.2, 4.4),
  vrectX(-3, 0.5, 0, 2.4, 4.4),
  ...cyl(2.2, 1.6, 0, 0.5, 1.2),
  L([
    [2.2, 1.6, 1.2],
    [1.4, 1.6, 2.6],
  ]),
];
const calendar = () => calendarAt(-2, 0);
const gantt = (): Part[] => {
  const o = [
    vrectX(-3.2, 0, 0, 6.4, 4.4),
    L([
      [-2.2, 0, 0],
      [-2.2, 0, 4.4],
    ]),
  ];
  (
    [
      [-1.9, 3.6, 2],
      [-0.6, 2.8, 2.2],
      [0.8, 2, 1.6],
      [1.2, 1.2, 1.6],
    ] as const
  ).forEach(([x, z, w]) =>
    o.push(
      Z([
        [x, 0, z],
        [x + w, 0, z],
        [x + w, 0, z + 0.45],
        [x, 0, z + 0.45],
      ]),
    ),
  );
  for (const z of [1, 1.8, 2.6, 3.4])
    o.push(
      L([
        [-3, 0, z + 0.22],
        [-2.4, 0, z + 0.22],
      ]),
    );
  return o;
};
const team = (): Part[] => [
  ...person(-2, 0),
  ...person(0, -0.8),
  ...person(2, 0),
  arcG(0, 0, 0, 2.9, 0, Math.PI * 2, 40),
];
const stack = (): Part[] => [
  ...box(-2.6, -1.4, 0, 2.4, 2.4, 1.4),
  ...box(-0.2, -1.4, 0, 2.4, 2.4, 1.4),
  ...box(-1.4, -1.4, 1.4, 2.4, 2.4, 1.4),
  ...box(-3, -1.8, -0.01, 5.6, 3.2, 0.01),
];
const progress = (): Part[] => [
  vrectX(-3, 0, 0, 6, 4),
  L([
    [-2.6, 0, 0.6],
    [-1.2, 0, 1.6],
    [0, 0, 1.2],
    [1.4, 0, 2.6],
    [2.6, 0, 3.4],
  ]),
  ...(
    [
      [-1.2, 1.6],
      [0, 1.2],
      [1.4, 2.6],
    ] as const
  ).map(([x, z]) => circ(x, 0, z, 0.14, 10)),
  L([
    [-2.6, 0, 0.4],
    [2.6, 0, 0.4],
  ]),
];
const magnifier = (): Part[] => [
  vcirc(-0.6, 0, 2.6, 1.5),
  vcirc(-0.6, 0, 2.6, 1.25),
  L([
    [0.5, 0, 1.5],
    [2.2, 0, -0.2],
  ]),
  L([
    [0.75, 0, 1.7],
    [2.45, 0, 0],
  ]),
  check(-0.6, 0.01, 2.4, 0.6),
];
const room = (): Part[] => [...corner(), ...sofa(-2.2, 0.6), ...lampAt(1.8, -0.6, 4)];
const floorplan = () => floorplanAt(false);
const remodel = () => floorplanAt(true);
const swatches = (): Part[] =>
  [0, 1, 2, 3, 4]
    .flatMap((i) => {
      const a = -0.5 + i * 0.28,
        c = Math.cos(a),
        sn = Math.sin(a),
        pts = (
          [
            [0, 0],
            [4.2, 0],
            [4.2, 1.3],
            [0, 1.3],
          ] as const
        ).map(([u, v]): Vec3 => [-2 + u * c - v * sn, -1 + u * sn + v * c, i * 0.32]);
      return [Z(pts), ...pts.map((p) => L([p, [p[0], p[1], p[2] + 0.16]]))];
    })
    .concat([
      circ(-2, -1, 1.6, 0.18, 10),
      L([
        [-2, -1, 0],
        [-2, -1, 1.6],
      ]),
    ]);
const furniture = (): Part[] => [
  ...table(-1.6, -1.2, 3.2, 2.2),
  ...chair(-3.2, -0.8),
  ...chair(2, -0.8),
];
const lamp = (): Part[] => [...lampAt(0, 0, 5.2), rect(-3, -2.4, 0, 6, 4.8)];
const crane = (): Part[] => [
  L([
    [-2, 0, 0],
    [-2, 0, 5.6],
  ]),
  L([
    [-1.4, 0, 0],
    [-1.4, 0, 5.6],
  ]),
  ...[1, 2, 3, 4, 5].map((z) =>
    L([
      [-2, 0, z - 0.6],
      [-1.4, 0, z],
    ]),
  ),
  L([
    [-3.2, 0, 5.6],
    [3.6, 0, 5.6],
  ]),
  L([
    [-1.7, 0, 6.6],
    [-3.2, 0, 5.6],
  ]),
  L([
    [-1.7, 0, 6.6],
    [3.6, 0, 5.6],
  ]),
  L([
    [2.6, 0, 5.6],
    [2.6, 0, 2.6],
  ]),
  ...box(1.9, -0.4, 1.8, 1.4, 0.8, 0.8),
];
const counter = (): Part[] => [
  ...box(-3, -0.6, 0, 6, 1.6, 2),
  ...box(-3, 1.4, 3, 6, 0.6, 1.4),
  L([
    [-3, 1, 2],
    [3, 1, 2],
  ]),
  ...[-1, 1].map((x) =>
    L([
      [x, 1, 0],
      [x, 1, 2],
    ]),
  ),
  ...[-1, 1].map((x) =>
    L([
      [x, 2, 3],
      [x, 2, 4.4],
    ]),
  ),
  L([
    [0.6, 1.6, 4.4],
    [0.2, 0.6, 5.4],
    [1.6, 0.6, 5.4],
    [1.8, 1.6, 4.4],
  ]),
];
const wardrobe = (): Part[] => [
  ...box(-2.4, -0.6, 0, 4.8, 1.6, 4.6),
  ...[-0.8, 0.8].map((x) =>
    L([
      [x, 1, 0],
      [x, 1, 4.6],
    ]),
  ),
  L([
    [-2.4, 1, 3.8],
    [2.4, 1, 3.8],
  ]),
  ...[-1.1, -0.5, 0.5, 1.1].map((x) =>
    L([
      [x, 1, 1.9],
      [x, 1, 2.5],
    ]),
  ),
];
const fluted = (): Part[] => {
  const o = [vrectX(-3.2, 0, 0, 6.4, 4.4)];
  for (let x = -2.8; x < 3.2; x += 0.4)
    o.push(
      L([
        [x, 0, 0.2],
        [x, 0, 4.2],
      ]),
    );
  return o;
};
const door = (): Part[] => [
  vrectX(-1.6, 0, 0, 3.2, 4.6),
  vrectX(-1.3, 0, 0, 2.6, 4.2),
  L([
    [-1.3, 0, 0],
    [-0.2, 1.8, 0],
    [-0.2, 1.8, 4.2],
    [-1.3, 0, 4.2],
  ]),
  circ(-0.4, 1.5, 2.1, 0.12, 10),
];
const desk = (): Part[] => [
  arcG(0, 2.6, 0, 3.6, Math.PI * 1.12, Math.PI * 1.88),
  arcG(0, 2.6, 1.9, 3.6, Math.PI * 1.12, Math.PI * 1.88),
  arcG(0, 2.6, 1.9, 2.6, Math.PI * 1.12, Math.PI * 1.88),
  ...[1.12, 1.88].map((a) =>
    L([
      [3.6 * Math.cos(Math.PI * a), 2.6 + 3.6 * Math.sin(Math.PI * a), 0],
      [3.6 * Math.cos(Math.PI * a), 2.6 + 3.6 * Math.sin(Math.PI * a), 1.9],
    ]),
  ),
  ...[1.3, 1.5, 1.7].map((a) =>
    L([
      [3.6 * Math.cos(Math.PI * a), 2.6 + 3.6 * Math.sin(Math.PI * a), 0.2],
      [3.6 * Math.cos(Math.PI * a), 2.6 + 3.6 * Math.sin(Math.PI * a), 1.7],
    ]),
  ),
];
const board = (): Part[] => [
  L([
    [-2.6, -1, 0],
    [-1.6, -0.2, 3.6],
  ]),
  L([
    [2.6, -1, 0],
    [1.6, -0.2, 3.6],
  ]),
  Z([
    [-3, -1.6, 2],
    [3, -1.6, 2],
    [2.4, 0.4, 4.6],
    [-2.4, 0.4, 4.6],
  ]),
  L([
    [-2, -1.2, 2.6],
    [1.8, -1.2, 2.6],
  ]),
  L([
    [-1.6, -1.3, 2.4],
    [-0.8, -0.1, 4],
  ]),
  rect(-0.6, -1.1, 2.9, 1.6, 1),
];
const plan2 = (): Part[] => [
  ...plane(3.6),
  ...(
    [
      [-3, -3, 2.4, 2],
      [0, -3, 3, 1.6],
      [-3, -0.4, 1.8, 3],
      [-0.6, -0.8, 3.6, 3.4],
    ] as const
  ).map(([x, y, w, d]) => rect(x, y, 0, w, d)),
  ...(
    [
      [-1.8, -2],
      [1.4, -2.2],
      [1.2, 0.8],
    ] as const
  ).flatMap(([x, y]) => box(x, y, 0, 0.8, 0.8, 0.6 + Math.abs(x) * 0.3)),
];
const building = (): Part[] => [
  ...box(-2.6, -1.8, 0, 5.2, 3.6, 3),
  ...hip(-2.6, -1.8, 3, 5.2, 3.6, 1.4),
  ...winX(-1.8, 1.8, 1, 1.2, 1.2),
  ...winX(0.6, 1.8, 1, 1.2, 1.2),
];
const elevation = (): Part[] => {
  const o = [
    vrectX(-3, 0, 0, 6, 4.6),
    L([
      [-3, 0, 4.6],
      [0, 0, 5.6],
      [3, 0, 4.6],
    ]),
  ];
  for (const z of [0.6, 2.6]) for (const x of [-2.4, -0.6, 1.2]) o.push(...winX(x, 0, z, 1.2, 1.4));
  return o;
};
const consult = (): Part[] => [
  ...table(-1.4, -1, 2.8, 2, 1.4),
  ...chair(-3.2, -0.5),
  ...chair(2.2, -0.5),
  ...docAt(-0.8, 0.2).slice(0, 1),
];
const plot = (): Part[] => {
  const o = [rect(-3.4, -2.4, 0, 6.8, 4.8)];
  (
    [
      [-3.4, -2.4],
      [3.4, -2.4],
      [3.4, 2.4],
      [-3.4, 2.4],
    ] as const
  ).forEach(([x, y]) =>
    o.push(
      L([
        [x, y, 0],
        [x, y, 0.8],
      ]),
    ),
  );
  o.push(
    L([
      [0, 0, 0],
      [0, 0, 3.4],
    ]),
    Z([
      [0, 0, 3.4],
      [1.6, 0, 3],
      [0, 0, 2.6],
    ]),
    dashed(rect(-1.6, -1.2, 0, 3.2, 2.4)),
  );
  return o;
};
const growth = (): Part[] => [
  ...bars([1, 1.8, 2.8, 4]),
  L([
    [-2.4, -0.6, 1.6],
    [-0.9, -0.6, 2.6],
    [0.6, -0.6, 3.4],
    [2.1, -0.6, 4.8],
  ]),
];
const bridge = (): Part[] => [
  ...box(-3.6, -1, 0, 2, 2, 2.4),
  ...box(1.6, -1, 0, 2, 2, 3.4),
  L([
    [-1.6, -0.4, 1.8],
    [1.6, -0.4, 1.8],
  ]),
  L([
    [-1.6, 0.6, 1.8],
    [1.6, 0.6, 1.8],
  ]),
  L([
    [-1.6, -0.4, 2.1],
    [0, -0.4, 2.8],
    [1.6, -0.4, 2.1],
  ]),
];
const layers = (): Part[] =>
  [0, 1.1, 2.2]
    .map((z, i) => rect(-2.8 + i * 0.2, -2 + i * 0.2, z, 5.6 - i * 0.4, 4 - i * 0.4))
    .concat([
      L([
        [-2.8, -2, 0],
        [-2.4, -1.6, 2.2],
      ]),
      L([
        [2.8, 2, 0],
        [2.4, 1.6, 2.2],
      ]),
    ]);
const pin = (): Part[] => [...plane(3.4), ...pinAt(0, 0)];
const globe = (): Part[] => [
  circ(-2, 0, 0, 1.6),
  circ(2, 0, 0, 1.6),
  ...pinAt(-2, 0).slice(2),
  ...pinAt(2.2, 0).slice(2),
  dashed(arcG(0, 0, 2.6, 2.2, Math.PI, 2 * Math.PI)),
];
const doc = (): Part[] => [...docAt(-1.3, 0), check(0.5, 0.02, 1, 0.5)];
const path = (): Part[] => [
  L([
    [-3.6, 1.8, 0],
    [-1.4, 1.8, 0],
    [-1.4, -0.6, 0],
    [1.4, -0.6, 0],
    [1.4, -2.2, 0],
    [3.4, -2.2, 0],
  ]),
  ...(
    [
      [-3.6, 1.8],
      [-1.4, -0.6],
      [1.4, -2.2],
    ] as const
  ).flatMap(([x, y]) => cyl(x, y, 0, 0.36, 0.6)),
  ...arrowG(2.4, -2.2, 3.8, -2.2),
];
const shield = (): Part[] => [
  ...houseAt(-1.8, -1.4, 3.6, 2.8, 1.8),
  dashed(rect(-3.2, -2.6, 0, 6.4, 5.2)),
  dashed(
    L([
      [-3.2, -2.6, 0],
      [-3.2, -2.6, 4.6],
    ]),
  ),
  dashed(
    L([
      [3.2, 2.6, 0],
      [3.2, 2.6, 4.6],
    ]),
  ),
  dashed(
    L([
      [3.2, -2.6, 0],
      [3.2, -2.6, 4.6],
    ]),
  ),
  dashed(rect(-3.2, -2.6, 4.6, 6.4, 5.2)),
];
const tools = () => toolsAt();
const scaffold = (): Part[] => [
  ...box(-2, -1.6, 0, 4, 3.2, 3.6),
  ...scaffoldAt(-2.4, 1.9, 4.8, 3.6),
];
const tree = (): Part[] => [...plane(3.4), ...treeAt(-1.2, -0.4), ...treeAt(1.8, 1, 0.7)];
const bolt = (): Part[] => [
  Z([
    [0.4, 0, 4.6],
    [-1.4, 0, 2],
    [0, 0, 2],
    [-0.6, 0, -0.2],
    [1.6, 0, 2.8],
    [0.2, 0, 2.8],
  ]),
  Z([
    [0.4, 0.6, 4.6],
    [-1.4, 0.6, 2],
    [0, 0.6, 2],
    [-0.6, 0.6, -0.2],
    [1.6, 0.6, 2.8],
    [0.2, 0.6, 2.8],
  ]),
];
const brace = (): Part[] => [
  ...box(-1.8, -0.4, 0, 0.8, 0.8, 4.4),
  ...box(1, -0.4, 0, 0.8, 0.8, 4.4),
  ...box(-2.4, -0.6, 4.4, 4.8, 1.2, 0.6),
  L([
    [-1, 0, 0.6],
    [1, 0, 3.8],
  ]),
  L([
    [1, 0, 0.6],
    [-1, 0, 3.8],
  ]),
  ...cyl(0, 1.6, 0, 0.4, 2.4),
];
const warehouse = (): Part[] => [
  ...box(-3.2, -2, 0, 6.4, 4, 2.4),
  ...gable(-3.2, -2, 2.4, 6.4, 4, 1.6),
  ...box(-1.6, -1, 0, 3.2, 2, 1.8).map(dashed),
];
const facadeNew = (): Part[] => {
  const o = [...box(-2.6, -1.2, 0, 5.2, 2.4, 4)];
  for (let x = -2.2; x < 2.6; x += 0.6)
    o.push(
      L([
        [x, 1.2, 0],
        [x, 1.2, 4],
      ]),
    );
  o.push(dashed(vrectX(-2.6, 1.6, 0, 5.2, 4)));
  return o;
};
const renoHouse = (): Part[] => [
  ...houseAt(-3, -1.6, 3.6, 3.2, 2),
  ...box(0.6, -1.6, 0, 2.6, 3.2, 2).map(dashed),
];
const bath = (): Part[] => [
  ...box(-3, -0.6, 0, 3.4, 1.8, 1.1),
  arcG(-1.3, 0.3, 1.1, 1.2, 0, Math.PI * 2),
  ...box(1, -0.6, 0, 1.6, 1.4, 1.6),
  vrectX(1.2, 0.8, 2.2, 1.2, 1.4),
  L([
    [-2.8, 1.2, 1.1],
    [-2.8, 1.2, 2.4],
    [-2.2, 1.2, 2.4],
  ]),
];
const hammer = (): Part[] => [...toolsAt()];

const ARTS = {
  house,
  tower,
  civic,
  hotel,
  frame,
  network,
  pipes,
  finish,
  calendar,
  gantt,
  team,
  stack,
  progress,
  magnifier,
  room,
  floorplan,
  remodel,
  swatches,
  furniture,
  lamp,
  crane,
  counter,
  wardrobe,
  fluted,
  door,
  desk,
  board,
  plan2,
  building,
  elevation,
  consult,
  plot,
  growth,
  bridge,
  layers,
  pin,
  globe,
  doc,
  path,
  shield,
  tools,
  scaffold,
  tree,
  bolt,
  brace,
  warehouse,
  facadeNew,
  renoHouse,
  bath,
  hammer,
} satisfies Record<string, () => Part[]>;

export type IconName = keyof typeof ARTS;

/** Every icon, in the original's declaration order. */
export const ICON_NAMES = Object.keys(ARTS) as readonly IconName[];

export function isIconName(name: string): name is IconName {
  return Object.hasOwn(ARTS, name);
}

/** The drawing for a feature-tile icon (original `KATIC_ICON.draw`; viewBox `0 0 292 180`). */
export function iconArt(name: IconName): ArtDrawing {
  return {
    viewBox: "0 0 292 180",
    preserveAspectRatio: "xMidYMid meet",
    lit: [],
    paths: toPaths(ARTS[name]()),
  };
}

/* ---------- title → icon picker ---------- */

/** First matching rule wins, unless its icon is already used in the grid. */
const RULES: readonly (readonly [RegExp, IconName])[] = [
  [/home renovation/i, "renoHouse"],
  [/landowner/i, "plot"],
  [/residential/i, "house"],
  [/commercial/i, "tower"],
  [/institution/i, "civic"],
  [/hospitality|hotel/i, "hotel"],
  [/structural &|civil works|structural repair/i, "brace"],
  [/structural|frame$/i, "frame"],
  [/project coord|coordinated exec|cross-border/i, "network"],
  [/mep|services/i, "pipes"],
  [/finishing/i, "finish"],
  [/routine|scheduling/i, "calendar"],
  [/workforce|team/i, "team"],
  [/material manag/i, "stack"],
  [/progress/i, "progress"],
  [/quality|inspection/i, "magnifier"],
  [/interior design|interior maint/i, "room"],
  [/space planning|spatial planning/i, "floorplan"],
  [/layout|remodel/i, "remodel"],
  [/material selection/i, "swatches"],
  [/loose furniture|^furniture/i, "furniture"],
  [/lighting/i, "lamp"],
  [/^execution|construction &|construction finish/i, "crane"],
  [/kitchens?$|kitchen &|bath/i, "bath"],
  [/^kitchens/i, "counter"],
  [/wardrobe|storage/i, "wardrobe"],
  [/panelling|screens/i, "fluted"],
  [/doors?/i, "door"],
  [/custom/i, "desk"],
  [/architectural design|design expertise/i, "board"],
  [/architectural planning/i, "plan2"],
  [/building design/i, "building"],
  [/elevation|facade design/i, "elevation"],
  [/consultation/i, "consult"],
  [/investor/i, "growth"],
  [/collaborat/i, "bridge"],
  [/integrated/i, "layers"],
  [/local presence/i, "pin"],
  [/responsib|accountab/i, "doc"],
  [/streamlined|journey/i, "path"],
  [/intent|protect/i, "shield"],
  [/repair/i, "tools"],
  [/civil & building/i, "scaffold"],
  [/landscape|upkeep/i, "tree"],
  [/emergency/i, "bolt"],
  [/facade refresh/i, "facadeNew"],
  [/adaptive/i, "warehouse"],
  [/project manag/i, "gantt"],
  [/project manag/i, "progress"],
];

/** Used, in order, when no rule matches (or every matching icon is taken). */
const FALLBACK: readonly IconName[] = [
  "layers",
  "network",
  "building",
  "plan2",
  "progress",
  "doc",
  "path",
  "stack",
  "growth",
  "bridge",
  "house",
  "tower",
];

/**
 * Picks the icon for a feature tile title and records it in `used` (original `KATIC_ICON.pick`).
 * Use one `used` set per grid so icons stay unique within it. Accepts plain text or the h3's HTML
 * (`&amp;` is decoded, exactly as the original did with `innerHTML`).
 */
export function pickIcon(title: string, used: Set<IconName>): IconName {
  const t = title.replace(/&amp;/g, "&");
  let n: IconName | null = null;
  if (/^kitchens$/i.test(t)) n = "counter";
  if (!n) {
    for (const [re, k] of RULES) {
      if (re.test(t) && !used.has(k)) {
        n = k;
        break;
      }
    }
  }
  n ??= FALLBACK.find((k) => !used.has(k)) ?? "layers";
  used.add(n);
  return n;
}

/** Icons for a whole grid, in tile order, with a fresh `used` set (what the original does). */
export function pickIcons(titles: readonly string[]): IconName[] {
  const used = new Set<IconName>();
  return titles.map((t) => pickIcon(t, used));
}
