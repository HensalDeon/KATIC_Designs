import { LAST_LEAD_STORAGE_KEY, type LastLead } from "./client";

/**
 * What /thank-you derives from the remembered lead (original `KB.thanks()`, JS 4501–4513, which
 * read `window.lastLead`). Pure functions, shared by the page's client island and its tests.
 */

/** Labels shown when there is no remembered lead (direct visit), as in the original markup. */
export const THANK_YOU_DEFAULTS = { source: "Website", service: "General enquiry" } as const;

/** Attribute the pre-paint script sets on <html> when the last lead could not be delivered. */
export const LEAD_STATUS_ATTRIBUTE = "data-lead-status";

/**
 * Readable name of the page the enquiry came from: "Home" for the home page, otherwise the page
 * title without its " | …" suffix (the original stripped " — Katic Designs", which no title used,
 * so it showed the full SEO title: KI-F05, docs/analysis/04 §14.15).
 */
export function leadSourceLabel(lead: Pick<LastLead, "sourcePath" | "sourceTitle"> | null): string {
  if (!lead) return THANK_YOU_DEFAULTS.source;
  if (lead.sourcePath === "/") return "Home";
  const name = lead.sourceTitle.split(" | ")[0]?.trim() ?? "";
  return name === "" ? THANK_YOU_DEFAULTS.source : name;
}

/** The enquiry as plain text (the original `lastLead.body`): contact details, answers, message. */
export function leadSummary(lead: LastLead): string {
  const lines = [
    `Name: ${lead.name}`,
    ...(lead.email ? [`Email: ${lead.email}`] : []),
    ...(lead.phone ? [`Phone: ${lead.phone}`] : []),
    `Service: ${lead.service}`,
    `Source page: ${leadSourceLabel(lead)}`,
    ...Object.entries(lead.extra ?? {}).map(([label, value]) => `${label}: ${value}`),
  ];
  return lead.details ? `${lines.join("\n")}\n\n${lead.details}` : lines.join("\n");
}

/** Pre-filled WhatsApp message of "Continue on WhatsApp" (original wording). */
export function whatsappMessage(lead: LastLead | null): string {
  return lead
    ? `Hi KATIC, here is my enquiry:\n\n${leadSummary(lead)}`
    : "Hi KATIC, I just sent an enquiry about a project.";
}

/** `mailto:` of the fallback's "Send by email" (original subject "Project enquiry — {service}"). */
export function enquiryMailto(email: string, lead: LastLead): string {
  const subject = encodeURIComponent(`Project enquiry — ${lead.service}`);
  return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(leadSummary(lead))}`;
}

/**
 * Inline script placed right after the "Source / Service" labels of /thank-you. On a full page
 * load (refresh, direct visit) it writes the remembered lead's labels and failed-delivery flag
 * before the first paint, so the server-rendered generic shell never visibly changes when the
 * client island hydrates (no layout shift). After a client-side navigation from a form it does not
 * run; the island then renders the lead directly. Mirrors `leadSourceLabel`; plain ES5.
 */
export const THANK_YOU_PREPAINT_SCRIPT = `(function(){try{var l=JSON.parse(sessionStorage.getItem(${JSON.stringify(LAST_LEAD_STORAGE_KEY)})||"null");if(!l)return;var t=String(l.sourceTitle||"").split(" | ")[0].trim(),s=l.sourcePath==="/"?"Home":t||${JSON.stringify(THANK_YOU_DEFAULTS.source)},a=document.querySelector("[data-lead-source]"),b=document.querySelector("[data-lead-service]");if(a)a.textContent=s;if(b)b.textContent=l.service||${JSON.stringify(THANK_YOU_DEFAULTS.service)};if(l.status==="unsent")document.documentElement.setAttribute(${JSON.stringify(LEAD_STATUS_ATTRIBUTE)},"unsent")}catch(e){}})();`;
