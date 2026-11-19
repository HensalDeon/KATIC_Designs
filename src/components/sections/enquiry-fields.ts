import type { ServiceOption } from "@/content/services";

/**
 * A page-specific extra select of the inline enquiry form (original `.f.half.sel`), e.g. Interior's
 * "Space" or Turnkey's "Budget Range". Answers travel in the lead's `extra` record keyed by
 * `label`, so two fields that share a short name on different pages never mean the same thing in
 * the inbox (KI-C13).
 */
export type EnquirySelectField = {
  /** Stable key, unique within the form (e.g. `space`, `builtUpArea`). */
  readonly name: string;
  /** Visible label; also the key in the lead's `extra` record. */
  readonly label: string;
  readonly options: readonly string[];
};

/**
 * How the form asks for the service:
 * - `select`: a required `<select>`, preselected with `defaultService` (most pages);
 * - `hidden`: no visible field; the lead is filed under `service` (Factory, KI-F01).
 */
export type EnquiryServiceField =
  | { readonly mode: "select"; readonly defaultService?: ServiceOption }
  | { readonly mode: "hidden"; readonly service: ServiceOption };

/** Name under which an extra select is posted, kept apart from the lead's own fields. */
export function extraFieldName(name: string): `extra:${string}` {
  return `extra:${name}`;
}

/**
 * The answered extra selects as `label → value`, or `undefined` when none was answered. Values
 * that are not one of the field's options are dropped.
 */
export function collectExtra(
  data: FormData,
  fields: readonly EnquirySelectField[],
): Record<string, string> | undefined {
  const entries = fields.flatMap((field) => {
    const raw = data.get(extraFieldName(field.name));
    return typeof raw === "string" && field.options.includes(raw)
      ? [[field.label, raw] as const]
      : [];
  });
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/** Name, email and phone always sit in the two-column part of the form. */
const FIXED_HALF_FIELDS = 3;

/**
 * Number of half-width fields before the details textarea. When it is odd, the last one spans
 * both columns so the grid never leaves an empty cell (KI-L22).
 */
export function halfFieldCount(service: EnquiryServiceField, extras: number): number {
  return FIXED_HALF_FIELDS + (service.mode === "select" ? 1 : 0) + extras;
}

/**
 * The details text with "Location: <location>" as its first line, as the original's `prefill()`
 * writes it (JS 4752); unchanged when it already has a location line.
 */
export function withLocationLine(details: string, location: string): string {
  if (details.includes("Location:")) return details;
  return `${`Location: ${location}\n${details}`.trim()}\n`;
}
