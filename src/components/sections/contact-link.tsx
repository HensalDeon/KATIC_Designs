"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";

import type { ServiceOption } from "@/content/services";
import { HOME_CONTACT_ID, useContactScroll } from "@/hooks/use-contact-scroll";
import { routes } from "@/lib/routes";

type ContactButtonProps = Omit<ComponentPropsWithoutRef<"button">, "onClick" | "type"> & {
  /** Service to preselect in the inline form (the original `data-svc`). */
  readonly service?: ServiceOption;
};

/**
 * A button that takes the visitor to the page's enquiry form (or home's), the original
 * `data-go="contact"`. Lets server components offer "go to contact" without a client wrapper.
 */
export function ContactButton({ service, ...props }: ContactButtonProps) {
  const goToContact = useContactScroll();
  return <button type="button" onClick={() => goToContact(service)} {...props} />;
}

type ContactLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  readonly service?: ServiceOption;
  /**
   * Where the link goes without JavaScript (or when opened in a new tab). Defaults to the home
   * page's contact section; pages with their own form can pass `#<their-contact-id>`.
   */
  readonly href?: string;
};

/**
 * Link flavour of `ContactButton`: a real anchor (progressive enhancement, KI-F07) whose plain
 * clicks are handled in-page.
 */
export function ContactLink({
  service,
  href = `${routes.home}#${HOME_CONTACT_ID}`,
  onClick,
  children,
  ...props
}: ContactLinkProps) {
  const goToContact = useContactScroll();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    // Let modified clicks (new tab/window) through to the browser.
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    if (event.button !== 0) return;
    event.preventDefault();
    goToContact(service);
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
