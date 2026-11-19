/**
 * Lead conversion events, mirroring the original (`generate_lead` for GTM, `Lead` for the Meta
 * pixel). No-ops until the client adds their tags.
 */
type AnalyticsWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  fbq?: (command: "track", event: string, params: Record<string, unknown>) => void;
};

export function trackLead({ service, source }: { service: string; source: string }): void {
  const w = window as AnalyticsWindow;
  w.dataLayer?.push({ event: "generate_lead", lead_source: source, lead_service: service });
  w.fbq?.("track", "Lead", { content_name: service, source });
}
