import type { SVGProps } from "react";

const PATHS = {
  /** → (`ARW` in the original). */
  right: "M1 6h9M6.5 2.5 10 6l-3.5 3.5",
  /** ↗ (`NE` in the original). */
  "up-right": "M3 9 9 3M4 3h5v5",
} as const;

export type ArrowDirection = keyof typeof PATHS;

type ArrowIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { direction?: ArrowDirection };

/** The 11px stroked arrows used in buttons and links. Decorative: hidden from assistive tech. */
export function ArrowIcon({
  direction = "right",
  width = 11,
  height = 11,
  ...props
}: ArrowIconProps) {
  return (
    <svg viewBox="0 0 12 12" width={width} height={height} aria-hidden focusable={false} {...props}>
      <path d={PATHS[direction]} fill="none" stroke="currentColor" strokeWidth={1.4} />
    </svg>
  );
}
