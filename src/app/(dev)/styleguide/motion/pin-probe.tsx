"use client";

import { useRef } from "react";

import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { pinProgress } from "@/lib/motion";

/**
 * Dev fixture for tests/e2e/zoom-geometry.spec.ts: a 3000px (canvas) section with a sticky,
 * one-screen stage that reports its scroll progress. Mirrors how the home page's pinned sections
 * are built, so the geometry is verified under the desktop canvas zoom in every engine.
 */
export function PinProbe() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useScrollProgress(sectionRef, (rect, viewportHeight) => {
    const progress = pinProgress(rect, viewportHeight);
    stageRef.current?.setAttribute("data-progress", progress.toFixed(3));
    barRef.current?.style.setProperty("transform", `scaleX(${progress})`);
  });

  return (
    <section
      ref={sectionRef}
      data-testid="pin-section"
      data-tone="dark"
      className="relative h-3000 bg-surface"
    >
      <div
        ref={stageRef}
        data-testid="pin-stage"
        className="sticky top-0 grid h-(--svh) place-items-center font-display text-[40px] text-white"
      >
        Pinned stage
        <div
          ref={barRef}
          className="absolute inset-x-0 bottom-0 h-6 origin-left scale-x-0 bg-brand"
        />
      </div>
    </section>
  );
}
