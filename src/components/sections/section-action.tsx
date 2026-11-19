import Link from "next/link";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { StartProjectTrigger } from "@/components/shell/start-project-trigger";
import type { ServiceOption } from "@/content/services";

import { ContactLink } from "./contact-link";

/**
 * A call to action in section content: a plain link, the Start-a-Project popup (`enquiry`), or the
 * page's own enquiry form (`contact`, the original's `data-go="contact" data-svc="…"`: scrolls to
 * the form and preselects the service). Plain data, so it can come from the CMS.
 */
export type SectionAction =
  | { readonly kind: "link"; readonly label: string; readonly href: string }
  | { readonly kind: "enquiry"; readonly label: string; readonly service?: ServiceOption }
  | {
      readonly kind: "contact";
      readonly label: string;
      readonly service?: ServiceOption;
      /**
       * Where the link points without JavaScript, e.g. `#turnkey-contact`. Defaults to the home
       * page's contact section; page renderers fill in their own section.
       */
      readonly href?: string;
    };

type ActionButtonProps = {
  readonly action: SectionAction;
  /** Full button classes (`buttonVariants(...)` plus overrides). */
  readonly className: string;
  readonly "data-testid"?: string;
};

/** Renders a `SectionAction` as a button-styled link, popup trigger or contact link with the ↗ arrow. */
export function ActionButton({ action, className, "data-testid": testId }: ActionButtonProps) {
  const content = (
    <>
      {action.label}
      <ArrowIcon direction="up-right" className="flex-none" />
    </>
  );

  if (action.kind === "link") {
    return (
      <Link href={action.href} className={className} data-testid={testId}>
        {content}
      </Link>
    );
  }
  if (action.kind === "contact") {
    return (
      <ContactLink
        {...(action.service ? { service: action.service } : {})}
        {...(action.href ? { href: action.href } : {})}
        className={className}
        data-testid={testId}
      >
        {content}
      </ContactLink>
    );
  }
  return (
    <StartProjectTrigger
      {...(action.service ? { service: action.service } : {})}
      className={className}
      data-testid={testId}
    >
      {content}
    </StartProjectTrigger>
  );
}
