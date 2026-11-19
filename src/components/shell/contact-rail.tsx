import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons/contact-icons";
import { SITE, whatsappUrl } from "@/content/site";
import { cn } from "@/lib/cn";

const item =
  "relative grid size-48 place-items-center shadow-rail after:pointer-events-none after:absolute after:top-1/2 after:right-58 after:-translate-y-1/2 after:translate-x-6 after:whitespace-nowrap after:bg-ink-2 after:px-12 after:py-8 after:font-sans after:text-[12px] after:font-medium after:text-white after:opacity-0 after:transition-[opacity,transform] after:duration-200 after:content-[attr(data-tip)] hover:after:translate-x-0 hover:after:opacity-100 focus-visible:after:translate-x-0 focus-visible:after:opacity-100";

/**
 * Floating quick-contact buttons on the right edge (`.rail.grail`), outside the zoomed canvas.
 * Hidden on phones, where the quick-contact bar replaces them (KI-L12).
 */
export function ContactRail() {
  return (
    <nav
      aria-label="Quick contact"
      className="fixed top-1/2 right-22 z-80 flex -translate-y-1/2 flex-col gap-10 max-md:hidden"
    >
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener"
        aria-label="Chat on WhatsApp"
        data-tip="Chat on WhatsApp"
        className={cn(item, "bg-brand text-white")}
      >
        <WhatsAppIcon width={20} height={20} />
      </a>
      <a
        href={`mailto:${SITE.email}`}
        aria-label="Send an Email"
        data-tip="Send an Email"
        className={cn(item, "bg-white text-ink-2")}
      >
        <MailIcon width={20} height={20} />
      </a>
      <a
        href={SITE.phone.href}
        aria-label="Call Us"
        data-tip="Call Us"
        className={cn(item, "bg-brand text-white")}
      >
        <PhoneIcon width={20} height={20} />
      </a>
    </nav>
  );
}
