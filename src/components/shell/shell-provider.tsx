"use client";

import { usePathname } from "next/navigation";
import { createContext, type ReactNode, use, useState } from "react";

import { serviceForPath, type ServiceOption } from "@/content/services";

type EnquiryOptions = { readonly service?: ServiceOption | undefined };

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
};

const ShellContext = createContext<ShellState | null>(null);

/** UI state shared by the header, overlays and quick-contact bar. */
export function ShellProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [explicitService, setExplicitService] = useState<ServiceOption | undefined>();

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
  };

  return <ShellContext value={value}>{children}</ShellContext>;
}

export function useShell(): ShellState {
  const state = use(ShellContext);
  if (!state) throw new Error("useShell must be used inside <ShellProvider>");
  return state;
}
