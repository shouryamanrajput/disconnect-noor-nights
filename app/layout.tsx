import type { Metadata, Viewport } from "next";
import { Yatra_One, Rozha_One, Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/config";
import SmoothScroll from "@/components/SmoothScroll";

// Devanagari display for "दिवाली" — brushy, festive, closest to the poster.
const hindi = Yatra_One({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-hindi",
  display: "swap",
});
// Bold high-contrast festive serif for Latin headlines ("House Party").
const display = Rozha_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});
// Engraved caps for dates and eyebrows ("OCT 31ST, 2026").
const caps = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-caps",
  display: "swap",
});
const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  ...(site.siteUrl ? { metadataBase: new URL(site.siteUrl) } : {}),
  title: `${site.event.title} · 31 Oct 2026 · Rohtak`,
  description: site.description,
  openGraph: {
    title: site.event.title,
    description: site.description,
    type: "website",
    images: ["/poster.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#27095E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets env(safe-area-inset-bottom) work for the sticky bar
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${hindi.variable} ${display.variable} ${caps.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-poster font-sans text-cream antialiased" suppressHydrationWarning>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
