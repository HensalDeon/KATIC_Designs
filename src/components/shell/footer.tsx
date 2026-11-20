import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { SocialIcon } from "@/components/icons/contact-icons";
import { StartProjectTrigger } from "@/components/shell/start-project-trigger";
import { resolveMedia } from "@/lib/media/resolve";
import { canvasVw, fixedCanvasSizes } from "@/lib/media/sizes";
import { routes } from "@/lib/routes";
import type { FooterColumn } from "@/lib/schemas/navigation";
import type { SiteContact } from "@/lib/schemas/site";

const columnTitle = "mb-16 font-display text-[15px] font-semibold";
const columnLink =
  "mb-8 block text-left font-display text-[14px] leading-[1.45] text-white/75 transition-colors hover:text-white";

type FooterProps = {
  /** Address, contact channels, credit and socials (site settings). */
  readonly site: SiteContact;
  /** The link columns before Address and Contact (navigation). */
  readonly columns: readonly FooterColumn[];
};

/** Site footer (`.ftw > .ft + .fbar`): black card on white, link columns, credits and socials. */
export function Footer({ site, columns }: FooterProps) {
  return (
    <div
      data-parity="footer"
      className="bg-white px-36 pt-28 max-md:px-12 max-md:pt-20 max-xs:pb-72"
    >
      <footer className="relative bg-black px-41 pt-48 pb-34 text-white shadow-footer max-md:px-22 max-md:pt-36 max-md:pb-28 max-xs:pb-72">
        <Link href={routes.home} aria-label="Katic Designs home" className="flex w-fit">
          {/* Intrinsic ratio at 28px tall; the original stretches it to 115px wide (KI-L07). */}
          <Image
            src={resolveMedia("brand/logo")}
            alt=""
            sizes={fixedCanvasSizes(50)}
            className="h-28 w-auto"
          />
        </Link>
        <Image
          src={resolveMedia("plants/banana-leaf-plant")}
          alt=""
          aria-hidden
          // 216px on the canvas, 189px at ≤1099, 96px on phones (the classes below).
          sizes={`(max-width: 860px) 96px, (max-width: 1099px) 189px, ${canvasVw(216)}`}
          className="pointer-events-none absolute top-20 right-48 z-3 max-h-252 w-216 object-contain max-lg:max-h-220 max-lg:w-189 max-md:top-14 max-md:right-14 max-md:max-h-112 max-md:w-96"
        />

        <h2 className="mt-22 mb-14 font-display text-[40px] leading-[1.1] font-bold tracking-[0.01em] max-md:pr-96 max-md:text-[30px]">
          Homes designed around
          <br />
          how you live.
        </h2>
        <p className="max-w-345 font-display text-[14px] leading-[1.8] text-white/75">
          Katic Designs is a residential and interior design studio offering turnkey architecture,
          construction, interior design, exterior design, and landscaping under one roof.
        </p>
        <StartProjectTrigger className="mt-22 inline-flex h-47 items-center gap-12 bg-brand-fill px-24 font-display text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-brand-fill-hover">
          Start a Project
          <ArrowIcon />
        </StartProjectTrigger>

        <div className="mt-42 grid grid-cols-[1fr_1.25fr_1.1fr_0.8fr_1fr_1.2fr] gap-20 max-lg:grid-cols-3 max-md:grid-cols-2">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className={columnTitle}>{column.title}</h3>
              {column.links.map((link) => (
                <Link key={link.href} href={link.href} className={columnLink}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
          <div>
            <h3 className={columnTitle}>Address</h3>
            <a href={site.address.mapsUrl} target="_blank" rel="noopener" className={columnLink}>
              {site.address.lines.map((line, index) => (
                <span key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </a>
          </div>
          <div>
            <h3 className={columnTitle}>Contact</h3>
            <a href={`mailto:${site.email}`} className={columnLink}>
              {site.email}
            </a>
            <a href={site.phone.href} className={columnLink}>
              {site.phone.display}
            </a>
            <StartProjectTrigger className={columnLink}>
              Enquire about a project
            </StartProjectTrigger>
          </div>
        </div>
      </footer>

      <div className="flex items-center justify-between px-41 pt-20 pb-16 font-display text-[12.5px] text-[#222] max-md:flex-col max-md:gap-14 max-md:px-12 max-md:py-18">
        <span>
          © {site.name} <CopyrightYear />. All Rights Reserved. ·{" "}
          <a href={site.credit.url} target="_blank" rel="noopener">
            {site.credit.label}
          </a>
        </span>
        <ul className="flex gap-12">
          {site.socials.map((social) => (
            <li key={social.network}>
              <a
                href={social.url}
                target="_blank"
                rel="noopener"
                aria-label={social.label}
                className="grid size-36 place-items-center border border-[#ddd] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-colors hover:border-ink-2"
              >
                <SocialIcon network={social.network} width={12} height={12} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Current year, cached so the footer stays static under Cache Components. */
// "use cache" functions must be async, even without an await.
// eslint-disable-next-line @typescript-eslint/require-await
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
