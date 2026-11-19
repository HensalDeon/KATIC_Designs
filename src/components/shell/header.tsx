"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PointerEvent, useEffect, useId, useRef, useState } from "react";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { useShell } from "@/components/shell/shell-provider";
import { media } from "@/content/media";
import { activeNavKey, HEADER_NAV, type NavItem, type NavKey } from "@/content/navigation";
import { useScrollSnapshot } from "@/hooks/use-scroll-snapshot";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

/** Scroll distance after which the header compacts (original `hdrState`). */
const SCROLLED_AFTER = 40;
const PHONE_QUERY = "(max-width: 860px)";

/**
 * Site header (`.hdr`). Fixed bar on the zoomed canvas; compacts after 40px of scroll.
 * Desktop: dropdowns open on hover or keyboard focus. Phones (≤860px): burger toggles a compact
 * panel; the first tap on an item with a submenu opens it, the second navigates.
 */
export function Header() {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen, enquiry } = useShell();
  const scrolled = useScrollSnapshot(() => window.scrollY > SCROLLED_AFTER, false);
  const activeKey = activeNavKey(pathname);
  const navId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  /** Desktop dropdown open via hover or focus. */
  const [openKey, setOpenKey] = useState<NavKey | null>(null);
  /** Phone submenu expanded by a first tap. */
  const [expandedKey, setExpandedKey] = useState<NavKey | null>(null);
  /** After a nav click, keep dropdowns shut until the pointer moves (original `body.nohover`). */
  const [suppressed, setSuppressed] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setExpandedKey(null);
  };

  // Phones: close the panel on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setExpandedKey(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen, setMenuOpen]);

  const onNavigate = () => {
    setOpenKey(null);
    setSuppressed(true);
    closeMenu();
  };

  const onItemClick = (item: NavItem, event: React.MouseEvent) => {
    const isPhone = window.matchMedia(PHONE_QUERY).matches;
    if (isPhone && item.dropdown && expandedKey !== item.key) {
      event.preventDefault();
      setExpandedKey(item.key);
      return;
    }
    onNavigate();
  };

  // Escape closes the phone panel (returning focus to the burger) or the open dropdown.
  useEffect(() => {
    if (!menuOpen && !openKey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (menuOpen) {
        setMenuOpen(false);
        setExpandedKey(null);
        burgerRef.current?.focus();
      } else {
        setOpenKey(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, openKey, setMenuOpen]);

  // Dropdowns stay suppressed after a nav click until the pointer moves again.
  useEffect(() => {
    if (!suppressed) return;
    const release = () => setSuppressed(false);
    window.addEventListener("pointermove", release, { once: true });
    return () => window.removeEventListener("pointermove", release);
  }, [suppressed]);

  const hoverOpen = (key: NavKey) => (event: PointerEvent) => {
    if (event.pointerType === "mouse" && !suppressed) setOpenKey(key);
  };

  return (
    <header
      ref={headerRef}
      data-scrolled={scrolled || undefined}
      className={cn(
        "fixed inset-x-36 top-18 z-50 flex h-62 items-center justify-between border border-[rgba(255,255,255,0.12)] bg-[rgba(22,22,22,0.86)] px-18 font-display text-white backdrop-blur-[10px] transition-[top,background-color,box-shadow,height] duration-350",
        "max-md:inset-x-14 max-md:top-12 max-md:h-58 max-md:bg-[rgba(22,22,22,0.94)] max-md:backdrop-blur-none",
        scrolled && "top-10 bg-[rgba(14,14,14,0.94)] shadow-header max-md:top-10",
      )}
    >
      <Link
        href={routes.home}
        aria-label="Katic Designs home"
        onClick={onNavigate}
        className="flex items-center gap-12"
      >
        <Image
          src={media["brand/logo"].image}
          alt=""
          priority
          sizes="78px"
          className={cn("w-auto transition-[height] duration-350", scrolled ? "h-38" : "h-44")}
        />
      </Link>

      <nav
        id={navId}
        aria-label="Main"
        className={cn(
          "flex items-center",
          // Phones: compact dropdown panel under the bar.
          "max-md:absolute max-md:top-[calc(100%_+_8px)] max-md:right-0 max-md:z-60 max-md:max-h-[min(calc(100dvh_-_96px),640px)] max-md:w-[min(300px,calc(100vw_-_28px))] max-md:flex-col max-md:items-stretch max-md:overflow-y-auto max-md:overscroll-contain max-md:border max-md:border-[#262626] max-md:bg-ink-2 max-md:px-16 max-md:pt-4 max-md:pb-14 max-md:shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
          !menuOpen && "max-md:hidden",
        )}
      >
        {HEADER_NAV.map((item) => (
          <NavEntry
            key={item.key}
            item={item}
            active={item.key === activeKey}
            open={openKey === item.key}
            expanded={expandedKey === item.key}
            onPointerEnter={hoverOpen(item.key)}
            onPointerLeave={() => setOpenKey(null)}
            onFocusWithin={() => setOpenKey(item.key)}
            onBlurWithin={() => setOpenKey((key) => (key === item.key ? null : key))}
            onItemClick={(event) => onItemClick(item, event)}
            onNavigate={onNavigate}
          />
        ))}
        <button
          type="button"
          onClick={() => enquiry.open()}
          className="ml-16 flex h-44 items-center gap-12 bg-brand px-22 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-brand-hover max-md:mt-12 max-md:ml-0 max-md:w-full max-md:justify-center max-md:text-[13px]"
        >
          Start a Project
          <ArrowIcon width={10} height={10} />
        </button>
      </nav>

      <button
        ref={burgerRef}
        type="button"
        aria-label={menuOpen ? "Close menu" : "Menu"}
        aria-expanded={menuOpen}
        aria-controls={navId}
        onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        className="relative z-70 hidden size-40 text-white max-md:grid max-md:place-items-center"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden focusable={false}>
          <path
            d={menuOpen ? "M6 6l12 12M18 6 6 18" : "M3 7h18M3 12h18M3 17h18"}
            stroke="currentColor"
            strokeWidth={1.6}
          />
        </svg>
      </button>
    </header>
  );
}

type NavEntryProps = {
  item: NavItem;
  active: boolean;
  /** Desktop dropdown visible. */
  open: boolean;
  /** Phone submenu visible. */
  expanded: boolean;
  onPointerEnter: (event: PointerEvent) => void;
  onPointerLeave: () => void;
  onFocusWithin: () => void;
  onBlurWithin: () => void;
  onItemClick: (event: React.MouseEvent) => void;
  onNavigate: () => void;
};

function NavEntry({
  item,
  active,
  open,
  expanded,
  onPointerEnter,
  onPointerLeave,
  onFocusWithin,
  onBlurWithin,
  onItemClick,
  onNavigate,
}: NavEntryProps) {
  const menuId = useId();
  const { dropdown } = item;
  const showChevronUp = open || expanded;

  return (
    // Hover-intent wrapper for a fly-out menu (WAI menu pattern): every control inside is a native
    // link, and keyboard users open the dropdown through focus, so no role is needed here.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onPointerEnter={dropdown ? onPointerEnter : undefined}
      onPointerLeave={dropdown ? onPointerLeave : undefined}
      onFocus={dropdown ? onFocusWithin : undefined}
      onBlur={
        dropdown
          ? (event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) onBlurWithin();
            }
          : undefined
      }
      className="relative flex items-center max-md:flex-col max-md:items-stretch max-md:border-b max-md:border-[#222]"
    >
      <Link
        href={item.href}
        onClick={onItemClick}
        aria-current={active ? "page" : undefined}
        aria-expanded={dropdown ? open || expanded : undefined}
        aria-controls={dropdown ? menuId : undefined}
        className={cn(
          "flex h-60 items-center gap-6 px-19 text-[15px] font-medium text-white hover:text-[#ffd9c7] max-lg:px-11 max-lg:text-[13px]",
          "max-md:h-auto max-md:justify-between max-md:px-0 max-md:py-11 max-md:text-[14px] max-md:tracking-[0.02em]",
          active && "font-semibold",
          open && "text-[#ffd9c7]",
        )}
      >
        {item.label}
        {dropdown ? (
          <svg
            viewBox="0 0 10 10"
            width="8"
            height="8"
            aria-hidden
            focusable={false}
            className={cn("transition-transform duration-250", showChevronUp && "rotate-180")}
          >
            <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth={1.3} />
          </svg>
        ) : null}
      </Link>

      {dropdown ? (
        <div
          id={menuId}
          className={cn(
            // Desktop dropdown.
            "absolute top-full left-0 w-max max-w-320 min-w-270 border border-[#2c2c2c] bg-[rgba(22,22,22,0.97)] shadow-dropdown backdrop-blur-[10px]",
            // Phones: inline submenu inside the panel.
            "max-md:static max-md:w-auto max-md:min-w-0 max-md:border-0 max-md:bg-transparent max-md:pb-12 max-md:shadow-none max-md:backdrop-blur-none",
            open ? "md:block" : "md:hidden",
            expanded ? "max-md:block" : "max-md:hidden",
          )}
        >
          {dropdown.groups.map((group) => (
            <div
              key={group.label}
              className="px-26 pt-16 pb-12 first:pt-20 max-md:p-0 max-md:first:pt-0 [&+&]:border-t [&+&]:border-[#333] max-md:[&+&]:border-t-0"
            >
              <small className="block pb-4 text-[11px] font-semibold tracking-[0.14em] text-brand uppercase max-md:hidden">
                {group.label}
              </small>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className="block py-6 text-[15.5px] leading-[1.25] text-[#e6e6e6] transition-[color,transform] duration-200 hover:translate-x-4 hover:text-white max-md:border-l max-md:border-[#333] max-md:pl-12 max-md:text-[13px] max-md:text-[#bbb] max-md:hover:translate-x-0 max-md:hover:border-brand"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
          {dropdown.all ? (
            <Link
              href={dropdown.all.href}
              onClick={onNavigate}
              className="block border-t border-[#333] px-26 pt-14 pb-18 text-[16px] font-semibold text-brand transition-colors duration-200 hover:text-[#ff8a5c] max-md:mt-4 max-md:border-t-0 max-md:py-8 max-md:pl-14 max-md:text-[13px]"
            >
              {dropdown.all.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
