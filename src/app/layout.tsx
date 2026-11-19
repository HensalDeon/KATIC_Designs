import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter, Jost } from "next/font/google";

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
    // data-scroll-behavior: keep CSS smooth scrolling for in-page anchors while
    // route changes jump instantly (Next 16 no longer does this by default).
    <html lang="en" data-scroll-behavior="smooth" className={`${jost.variable} ${inter.variable}`}>
      <body className="bg-white font-sans text-black antialiased">{children}</body>
    </html>
  );
}
