import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter, Jost } from "next/font/google";

import { ZOOM_BOOTSTRAP_SCRIPT } from "@/lib/zoom";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Architects, Interior Designers & Builders in Kochi, Kerala | Katic Designs",
    template: "%s | Katic Designs",
  },
  description:
    "Katic Designs is an architecture, interior design and construction studio in Kochi, Kerala and Dubai. Design, build, turnkey homes and property care under one roof.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
      </head>
      <body>
        {/* Everything inside is scaled at ≥1100px; overlays (rail, modal, lightbox) render outside. */}
        <div className="zoom-root">{children}</div>
      </body>
    </html>
  );
}
