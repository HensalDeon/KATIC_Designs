"use client";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { ChatIcon, PhoneIcon } from "@/components/icons/contact-icons";
import { useShell } from "@/components/shell/shell-provider";
import { SITE, whatsappUrl } from "@/content/site";
import { useScrollSnapshot } from "@/hooks/use-scroll-snapshot";
import { cn } from "@/lib/cn";

/** The bar appears once the hero is (almost) scrolled past… */
const HERO_OFFSET = 140;
/** …and hides again near the end of the page, so it never covers the footer. */
const END_OFFSET = 260;

/** Visible-past-hero logic of the original `.mcta` (JS 5222–5228). Pages mark their hero with `data-hero`. */
function readVisible(): boolean {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  const pastHero = !hero || window.scrollY > hero.offsetHeight - HERO_OFFSET;
  const atEnd =
    window.innerHeight + window.scrollY > document.documentElement.scrollHeight - END_OFFSET;
  return pastHero && !atEnd;
}

const pill =
  "flex h-50 items-center justify-center gap-8 font-display text-[12px] font-medium uppercase tracking-[0.12em] text-white shadow-mcta";

/** Sticky quick-contact bar for phones (`.mcta`, ≤860px only), outside the zoomed canvas. */
export function MobileCtaBar() {
  const { menuOpen, enquiry } = useShell();
  const scrolledIn = useScrollSnapshot(readVisible, false);
  const visible = scrolledIn && !menuOpen && !enquiry.isOpen;

  return (
    <nav
      aria-label="Quick contact"
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "fixed inset-x-10 bottom-10 z-150 hidden grid-cols-[auto_auto_1fr] gap-6 pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out-k max-md:grid max-xs:grid-cols-[50px_50px_1fr]",
        visible ? "translate-y-0" : "translate-y-[130%]",
      )}
    >
      <a
        href={SITE.phone.href}
        className={cn(pill, "border border-[#2a2a2a] bg-ink-2 px-14 max-xs:px-0")}
      >
        <PhoneIcon width={18} height={18} />
        <span className="max-xs:sr-only">Call</span>
      </a>
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener"
        className={cn(pill, "border border-[#2a2a2a] bg-ink-2 px-14 max-xs:px-0")}
      >
        <ChatIcon width={18} height={18} />
        <span className="max-xs:sr-only">WhatsApp</span>
      </a>
      <button
        type="button"
        onClick={() => enquiry.open()}
        className={cn(pill, "bg-brand-fill px-12 whitespace-nowrap")}
      >
        Start a Project
        <ArrowIcon className="flex-none" />
      </button>
    </nav>
  );
}
