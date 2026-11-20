import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter, Jost } from "next/font/google";

import { LightboxProvider } from "@/components/overlays/lightbox";
import { StartProjectDialog } from "@/components/overlays/start-project-dialog";
import { ToastProvider } from "@/components/overlays/toast";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactRail } from "@/components/shell/contact-rail";
import { Footer } from "@/components/shell/footer";
import { Header } from "@/components/shell/header";
import { LegacyHashRedirect } from "@/components/shell/legacy-hash-redirect";
import { MobileCtaBar } from "@/components/shell/mobile-cta-bar";
import { ShellProvider } from "@/components/shell/shell-provider";
import { SkipLink } from "@/components/shell/skip-link";
import { getNavigation, getSite, listDivisions } from "@/lib/data";
import { resolveMedia } from "@/lib/media/resolve";
import { siteContact } from "@/lib/schemas/site";
import { siteJsonLd } from "@/lib/seo/json-ld";
import { rootMetadata } from "@/lib/seo/metadata";
import { ZOOM_BOOTSTRAP_SCRIPT } from "@/lib/zoom";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/** Site-wide defaults (`metadataBase`, robots, Open Graph, Twitter); each page sets its own. */
export async function generateMetadata(): Promise<Metadata> {
  return rootMetadata(await getSite());
}

export const viewport: Viewport = {
  themeColor: "#000000",
};

/**
 * The site shell. Settings, menus and the division list come from the data layer (`@/lib/data`)
 * and reach the shell as props; client islands read the settings through `useSite()`.
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [site, navigation, divisions] = await Promise.all([
    getSite(),
    getNavigation(),
    listDivisions(),
  ]);
  const contact = siteContact(site);

  return (
    // data-scroll-behavior: keep CSS smooth scrolling for in-page anchors while route changes jump
    // instantly (Next 16 no longer does this by default).
    // suppressHydrationWarning: the zoom script sets --z/--svh on <html> before React hydrates.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${jost.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint so the 1440px desktop canvas never flashes unscaled (D1). */}
        <script dangerouslySetInnerHTML={{ __html: ZOOM_BOOTSTRAP_SCRIPT }} />
        {/* Organization, both offices and the WebSite, on every page (pages add their own). */}
        <JsonLd data={siteJsonLd(site, divisions)} />
      </head>
      <body>
        <SkipLink />
        <ShellProvider site={contact}>
          <ToastProvider>
            <LightboxProvider>
              {/* Scaled at ≥1100px (D1). Overlays below render outside it, at real size. */}
              <div className="zoom-root">
                <Header logo={resolveMedia("brand/logo")} nav={navigation.header} />
                <main id="main" tabIndex={-1} className="outline-none">
                  {children}
                </main>
                <Footer site={contact} columns={navigation.footer} />
              </div>
              <ContactRail site={contact} />
              <MobileCtaBar />
              <StartProjectDialog />
              <LegacyHashRedirect />
            </LightboxProvider>
          </ToastProvider>
        </ShellProvider>
      </body>
    </html>
  );
}
