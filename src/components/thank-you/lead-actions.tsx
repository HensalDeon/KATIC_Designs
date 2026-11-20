"use client";

import { useEffect, useState } from "react";

import { whatsappUrl } from "@/components/sections/contact-channels";
import { useSite } from "@/components/shell/shell-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { useLastLead } from "@/hooks/use-last-lead";
import { cn } from "@/lib/cn";
import {
  enquiryMailto,
  LEAD_STATUS_ATTRIBUTE,
  leadSummary,
  whatsappMessage,
} from "@/lib/leads/thank-you";
import { routes } from "@/lib/routes";
import type { ThankYouContent } from "@/lib/schemas/thank-you";

export type LeadActionsCopy = Pick<ThankYouContent, "fallback" | "whatsapp" | "back" | "projects">;

/**
 * The fallback box (`.ty-fb`, original line 4391) and the buttons (`.btns`, line 4392) of
 * /thank-you, wired to the enquiry just sent like the original `KB.thanks()`: WhatsApp opens with
 * the enquiry pre-filled, "Back to Previous Page" returns to the page the form was on (Home on a
 * direct visit), and when the lead could not be delivered the box offers email and copy-to-
 * clipboard.
 *
 * The box is in the server HTML but hidden; on a full page load the pre-paint script flags a failed
 * delivery on <html> so it is visible from the first paint (no layout shift), and once the stored
 * lead is read the island's own state decides.
 */
export function LeadActions({ copy }: { readonly copy: LeadActionsCopy }) {
  const lead = useLastLead();
  const site = useSite();
  const [copied, setCopied] = useState(false);

  // The pre-paint flag only bridges hydration; drop it when leaving so it never goes stale.
  useEffect(() => () => document.documentElement.removeAttribute(LEAD_STATUS_ATTRIBUTE), []);

  const fallbackVisibility = lead
    ? lead.status === "unsent"
      ? "block"
      : "hidden"
    : "hidden in-data-[lead-status=unsent]:block";

  async function copyDetails() {
    if (!lead) return;
    try {
      await navigator.clipboard.writeText(leadSummary(lead));
      setCopied(true);
    } catch {
      // Clipboard blocked: the email and WhatsApp buttons still carry the details.
    }
  }

  return (
    <>
      <div
        data-testid="lead-fallback"
        className={cn("mt-28 border border-[#e3dfd7] bg-[#faf9f6] px-22 py-20", fallbackVisibility)}
      >
        <p className="font-display text-[14.5px] leading-[1.65] text-[#333]">
          {copy.fallback.message}
        </p>
        <div className="mt-14 flex flex-wrap gap-12">
          <ButtonLink
            variant="outline"
            icon={null}
            href={lead ? enquiryMailto(site.email, lead) : `mailto:${site.email}`}
          >
            {copy.fallback.email}
          </ButtonLink>
          <Button variant="outline" icon={null} onClick={() => void copyDetails()}>
            {copied ? copy.fallback.copied : copy.fallback.copy}
          </Button>
        </div>
      </div>
      <div className="mt-44 flex flex-wrap justify-center gap-14">
        <ButtonLink
          variant="primary"
          icon="up-right"
          href={whatsappUrl(site, whatsappMessage(lead))}
          target="_blank"
          rel="noopener"
        >
          {copy.whatsapp}
        </ButtonLink>
        <ButtonLink variant="outline" icon="up-right" href={lead?.sourcePath ?? routes.home}>
          {copy.back}
        </ButtonLink>
        <ButtonLink variant="outline" icon="up-right" href={copy.projects.href}>
          {copy.projects.label}
        </ButtonLink>
      </div>
    </>
  );
}
