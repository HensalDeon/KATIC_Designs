"use client";

import { createContext, type ReactNode, use, useRef, useState } from "react";

import { cn } from "@/lib/cn";

const VISIBLE_MS = 2600;

const ToastContext = createContext<((message: string) => void) | null>(null);

/** Transient status message at the bottom of the screen (`.toast`), announced politely. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = (next: string) => {
    clearTimeout(timer.current);
    setMessage(next);
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), VISIBLE_MS);
  };

  return (
    <ToastContext value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed bottom-24 left-1/2 z-999 -translate-x-1/2 bg-ink-2 px-20 py-12 font-sans text-[13px] text-white transition-transform duration-300",
          visible ? "translate-y-0" : "translate-y-120",
        )}
      >
        {message}
      </div>
    </ToastContext>
  );
}

export function useToast(): (message: string) => void {
  const show = use(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>");
  return show;
}
