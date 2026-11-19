"use client";

import { useRouter } from "next/navigation";

import { useShell } from "@/components/shell/shell-provider";
import type { ServiceOption } from "@/content/services";
import { routes } from "@/lib/routes";

/** Marks a page's contact section; `goToContact` scrolls to the first one on the page. */
export const CONTACT_SECTION_ATTRIBUTE = "data-contact-section";

/** Home's contact section id (the original `#start`), the fallback for pages without one. */
export const HOME_CONTACT_ID = "start";

/** Upper bound for a smooth scroll, in case `scrollend` never fires (e.g. Safari < 26). */
const SCROLL_FALLBACK_MS = 1000;

const FIRST_FIELD = "input:not([type=hidden]):not([tabindex='-1']), select, textarea";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Runs `callback` once the window has stopped scrolling (or after a fallback delay). */
function afterScroll(callback: () => void): void {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    window.removeEventListener("scrollend", finish);
    clearTimeout(timer);
    callback();
  };
  const timer = setTimeout(finish, SCROLL_FALLBACK_MS);
  window.addEventListener("scrollend", finish);
}

/**
 * "Go to contact" (the original `#contact` / `data-go="contact"` behaviour, JS 4753–4763).
 *
 * If the current page has a contact section (`[data-contact-section]`), it smooth-scrolls there
 * (instantly with reduced motion), preselects `service` in the inline form, lets the form apply its
 * page prefill (`ContactArrival`), and focuses the first field once the scroll has settled. Otherwise it navigates to the home page's contact section
 * (`/#start`), carrying the service along.
 */
export function useContactScroll(): (service?: ServiceOption) => void {
  const { contact } = useShell();
  const router = useRouter();

  return (service) => {
    const section = document.querySelector<HTMLElement>(`[${CONTACT_SECTION_ATTRIBUTE}]`);
    if (!section) {
      if (service) contact.preselect(service, routes.home);
      router.push(`${routes.home}#${HOME_CONTACT_ID}`);
      return;
    }

    if (service) contact.preselect(service, window.location.pathname);
    contact.arrive(window.location.pathname);
    const focusFirstField = () => {
      section.querySelector<HTMLElement>(FIRST_FIELD)?.focus({ preventScroll: true });
    };

    const reduced = prefersReducedMotion();
    const alreadyThere = Math.abs(section.getBoundingClientRect().top) < 2;
    section.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
    if (reduced || alreadyThere) focusFirstField();
    else afterScroll(focusFirstField);
  };
}
