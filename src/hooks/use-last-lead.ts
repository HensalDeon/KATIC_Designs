"use client";

import { useMemo, useSyncExternalStore } from "react";

import { type LastLead, parseLastLead, readLastLeadRaw } from "@/lib/leads/client";

/** sessionStorage fires no event in the tab that wrote it; the lead is set before navigating. */
const subscribe = () => () => undefined;

/**
 * The enquiry remembered by the forms before they navigate to /thank-you (KI-F06). `null` while
 * hydrating server HTML, on a direct visit, or when storage is unavailable.
 */
export function useLastLead(): LastLead | null {
  const raw = useSyncExternalStore(subscribe, readLastLeadRaw, () => null);
  return useMemo(() => parseLastLead(raw), [raw]);
}
