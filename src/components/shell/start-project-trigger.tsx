"use client";

import type { ComponentPropsWithoutRef } from "react";

import { useShell } from "@/components/shell/shell-provider";
import type { ServiceOption } from "@/content/services";

type StartProjectTriggerProps = Omit<ComponentPropsWithoutRef<"button">, "onClick" | "type"> & {
  service?: ServiceOption;
};

/** A button that opens the Start-a-Project popup. Lets server components offer the popup. */
export function StartProjectTrigger({ service, ...props }: StartProjectTriggerProps) {
  const { enquiry } = useShell();
  return <button type="button" onClick={() => enquiry.open({ service })} {...props} />;
}
