import type { ServiceSlug } from "@/lib/routes";

/** The service options offered in every enquiry form (original `SV` list), in display order. */
export const SERVICE_OPTIONS = [
  "Architectural Design",
  "Interior Design",
  "Construction & Execution",
  "Turnkey Projects",
  "Renovation & Remodeling",
  "Exterior & Landscape Design",
  "Property Care & Maintenance",
] as const;
export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

/** Extra option available in the Start-a-Project popup. */
export const SERVICE_NOT_SURE = "Not sure yet";

/**
 * Service preselected when an enquiry starts from a given page (original `PREFILL`). Factory leads
 * stay "Interior Design" for parity; KI-C14 tracks giving them their own option.
 */
export const SERVICE_FOR_PAGE: Partial<Record<ServiceSlug | `div-${string}`, ServiceOption>> = {
  architecture: "Architectural Design",
  interior: "Interior Design",
  factory: "Interior Design",
  construction: "Construction & Execution",
  turnkey: "Turnkey Projects",
  renovation: "Renovation & Remodeling",
  exterior: "Exterior & Landscape Design",
  "property-care": "Property Care & Maintenance",
  "div-design": "Architectural Design",
  "div-interior": "Interior Design",
  "div-infrastructure": "Construction & Execution",
  "div-care": "Property Care & Maintenance",
};

/** Service to preselect for an enquiry started on `pathname`, if any. */
export function serviceForPath(pathname: string): ServiceOption | undefined {
  const [, section, slug] = pathname.split("/");
  if (section === "services" && slug) return SERVICE_FOR_PAGE[slug as ServiceSlug];
  if (section === "divisions" && slug) return SERVICE_FOR_PAGE[`div-${slug}`];
  return undefined;
}
