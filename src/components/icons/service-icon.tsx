import type { ReactNode, SVGProps } from "react";

/**
 * The 24×24 line icons the original renders inside `.nico` (stroke 1.5, round caps).
 * Paths are copied verbatim from the source; names describe the drawing, not one usage.
 */
const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="m11 7-6 14M13 7l6 14M7.5 15h9" />
    </>
  ),
  crane: (
    <>
      <path d="M6 21V4l12 3H6M6 7l6-3" />
      <path d="M15 7v5M13 12h4v3h-4zM3 21h8" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9M17 6l3 3M14 9l2 2" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-9 6-15 15-15 0 9-6 15-15 15z" />
      <path d="M5 19 14 10" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  tools: (
    <>
      <path d="m14 7-9.5 9.5a2 2 0 0 0 3 3L17 10" />
      <path d="m12 5 4-2 5 5-2 4-2-2-3 1-2-2 1-3z" />
    </>
  ),
  door: (
    <>
      <path d="M6 21V3h12v18M3 21h18" />
      <path d="M14 12h.01" />
    </>
  ),
  house: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v10h14V10M10 20v-5h4v5" />
    </>
  ),
  office: (
    <>
      <rect x="5" y="3" width="14" height="18" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M3 21h18" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r=".6" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  "badge-check": (
    <>
      <path d="M12 3 14.5 5H18v3.5L20 11l-2 2.5V17h-3.5L12 19.5 9.5 17H6v-3.5L4 11l2-2.5V5h3.5z" />
      <path d="m9 11 2 2 4-4" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  kitchen: (
    <>
      <rect x="3" y="10" width="18" height="10" />
      <path d="M3 14h18M12 10v10M7 4v3M10 4v3M14 5h6v3h-6z" />
    </>
  ),
  wardrobe: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M12 3v18M10 11v2M14 11v2" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14c2.8 0 5 2.2 5 5" />
    </>
  ),
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />,
  facade: (
    <>
      <path d="M3 21h18M5 21V9l7-5 7 5v12" />
      <path d="M9 21v-6h6v6M9 11h.01M15 11h.01" />
    </>
  ),
  sofa: (
    <>
      <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
      <path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z" />
      <path d="M5 18v2M19 18v2" />
    </>
  ),
  bulb: (
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6h12v10H2zM14 10h4l3 3v3h-7" />
      <circle cx="6" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.5-2.5-1.5M12 6.5v1.5M12 16v1.5" />
    </>
  ),
  message: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
} as const satisfies Record<string, ReactNode>;

export type ServiceIconName = keyof typeof ICONS;

export const SERVICE_ICON_NAMES = Object.keys(ICONS) as ServiceIconName[];

type ServiceIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: ServiceIconName;
  /** Rendered size in px (`.nico` default 28; 20/22/30/34 in specific contexts). */
  size?: number;
};

/** A decorative line icon in the current text colour. */
export function ServiceIcon({ name, size = 28, ...props }: ServiceIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
      {...props}
    >
      {ICONS[name]}
    </svg>
  );
}
