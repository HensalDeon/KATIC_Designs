"use client";

import { useLastLead } from "@/hooks/use-last-lead";
import { leadSourceLabel, THANK_YOU_DEFAULTS } from "@/lib/leads/thank-you";
import type { ThankYouContent } from "@/lib/schemas/thank-you";

export type LeadReferencesCopy = Pick<ThankYouContent, "sourceLabel" | "serviceLabel">;

/**
 * `.kty .ref` (original line 4385): the "Source" and "Service" chips of the enquiry just sent,
 * "Website" / "General enquiry" on a direct visit. The values are text-safe orange (KI-A11).
 *
 * On a full page load the pre-paint script has already written the values into the server HTML;
 * `suppressHydrationWarning` keeps them while hydrating with the generic server snapshot, and the
 * client snapshot then renders the same text, so nothing moves.
 */
export function LeadReferences({ copy }: { readonly copy: LeadReferencesCopy }) {
  const lead = useLastLead();
  const chip =
    "border border-[#ddd] px-14 py-8 font-sans text-[11px] font-medium tracking-[0.08em]";
  const value = "font-semibold text-kicker";
  return (
    <div
      className="mt-22 inline-flex flex-wrap justify-center gap-10"
      data-testid="lead-references"
    >
      <span className={chip}>
        {copy.sourceLabel}{" "}
        <b data-lead-source className={value} suppressHydrationWarning>
          {leadSourceLabel(lead)}
        </b>
      </span>
      <span className={chip}>
        {copy.serviceLabel}{" "}
        <b data-lead-service className={value} suppressHydrationWarning>
          {lead?.service ?? THANK_YOU_DEFAULTS.service}
        </b>
      </span>
    </div>
  );
}
