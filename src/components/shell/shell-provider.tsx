"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode, use, useState } from "react";

import { serviceForPath, type ServiceOption } from "@/content/services";

type EnquiryOptions = { readonly service?: ServiceOption | undefined };

/**
 * A request to preselect a service in the inline enquiry form of the page at `path` (the
 * original `data-svc` prefill). `id` changes on every request, so a repeated request overrides
 * whatever the visitor chose in the meantime.
 */
export type ContactRequest = {
  readonly id: number;
  readonly path: string;
  readonly service: ServiceOption;
};

type ShellState = {
  /** Mobile navigation panel (≤860px). */
  readonly menuOpen: boolean;
  readonly setMenuOpen: (open: boolean) => void;
  /** Start-a-Project popup. */
  readonly enquiry: {
    readonly isOpen: boolean;
    /** Service to preselect: explicit option, else the current page's service. */
    readonly service: ServiceOption | undefined;
    readonly open: (options?: EnquiryOptions) => void;
    readonly close: () => void;
  };
  /** Inline contact form ("go to contact"). */
  readonly contact: {
    readonly request: ContactRequest | undefined;
    readonly preselect: (service: ServiceOption, path: string) => void;
  };
};

const ShellContext = createContext<ShellState | null>(null);

/** UI state shared by the header, overlays, quick-contact bar and inline contact forms. */
export function ShellProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [explicitService, setExplicitService] = useState<ServiceOption | undefined>();
  const [contactRequest, setContactRequest] = useState<ContactRequest | undefined>();

  const value: ShellState = {
    menuOpen,
    setMenuOpen,
    enquiry: {
      isOpen: enquiryOpen,
      service: explicitService ?? serviceForPath(pathname),
      open: (options) => {
        setMenuOpen(false);
        setExplicitService(options?.service);
        setEnquiryOpen(true);
      },
      close: () => setEnquiryOpen(false),
    },
    contact: {
      request: contactRequest,
      preselect: (service, path) => {
        setContactRequest((previous) => ({ id: (previous?.id ?? 0) + 1, path, service }));
      },
    },
  };

  return <ShellContext value={value}>{children}</ShellContext>;
}

export function useShell(): ShellState {
  const state = use(ShellContext);
  if (!state) throw new Error("useShell must be used inside <ShellProvider>");
  return state;
}
