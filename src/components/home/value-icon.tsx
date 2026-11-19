import { ServiceIcon } from "@/components/icons/service-icon";
import type { HomeValueIcon } from "@/content/home/about";

const SIZE = 20;

/**
 * The 20px line icons of the home values list (`.vals .nico`). Three are shared `ServiceIcon`
 * drawings; the open hand (Craftsmanship) appears only here. Paths verbatim from the original.
 */
export function ValueIcon({ name }: { readonly name: HomeValueIcon }) {
  if (name !== "hand") return <ServiceIcon name={name} size={SIZE} />;
  return (
    <svg
      viewBox="0 0 24 24"
      width={SIZE}
      height={SIZE}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable={false}
    >
      <path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9a1.5 1.5 0 0 1 3 0v4a8 8 0 0 1-8 8c-3 0-4.5-1.5-6.5-4L3 14c-.8-1.2.8-2.6 2-1.5L7 14" />
    </svg>
  );
}
