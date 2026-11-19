/** First focusable element: jumps keyboard users past the header (`.skip-link`). */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed -top-80 left-16 z-1000 border-2 border-brand bg-white px-18 py-12 font-display text-[14px] font-medium text-ink-2 transition-[top] duration-200 focus:top-16"
    >
      Skip to main content
    </a>
  );
}
