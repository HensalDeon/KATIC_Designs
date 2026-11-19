import Link from "next/link";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { StartProjectTrigger } from "@/components/shell/start-project-trigger";
import type { ServiceOption } from "@/content/services";

/**
 * A call to action in section content: a plain link, or the Start-a-Project popup (the original's
 * `data-go="contact" data-svc="…"` buttons), optionally preselecting a service.
 */
export type SectionAction =
  | { readonly kind: "link"; readonly label: string; readonly href: string }
  | { readonly kind: "enquiry"; readonly label: string; readonly service?: ServiceOption };

type ActionButtonProps = {
  readonly action: SectionAction;
  /** Full button classes (`buttonVariants(...)` plus overrides). */
  readonly className: string;
  readonly "data-testid"?: string;
};

/** Renders a `SectionAction` as a button-styled link or popup trigger with the ↗ arrow. */
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
