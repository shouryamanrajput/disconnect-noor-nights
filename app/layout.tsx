import type { Metadata, Viewport } from "next";
import { Laila, Amarante, Montserrat, PT_Serif, Fraunces } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/config";
import SmoothScroll from "@/components/SmoothScroll";

// Fonts matched against the poster (see shots/font-compare.png):
// "दिवाली" → Laila Bold (heavy Devanagari with cut, flared terminals)
const hindi = Laila({ subsets: ["devanagari", "latin"], weight: ["600", "700"], variable: "--font-hindi", display: "swap" });
// "HOUSE PARTY" + section titles → Amarante (condensed flared festive display)
const display = Amarante({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
// "5:30 PM ONWARDS", "DRESS LIKE YOU ARE…" → PT Serif (classic book-serif caps)
const caps = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-caps", display: "swap" });
// "OCT 31ST, 2026", "OMAXE, ROHTAK", "INVITE-ONLY" + body → Montserrat (bold geometric sans)
const sans = Montserrat({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// "disconnect" wordmark → Fraunces Black, soft (chunky rounded serif)
const logo = Fraunces({ subsets: ["latin"], axes: ["SOFT"], variable: "--font-logo", display: "swap" });

export const metadata: Metadata = {
  ...(site.siteUrl ? { metadataBase: new URL(site.siteUrl) } : {}),
  title: `${site.event.title} · 31 Oct 2026 · Omaxe, Rohtak`,
  description: site.description,
  openGraph: {
    title: site.event.title,
    description: site.description,
    type: "website",
    images: ["/poster.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#5B1A80",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // lets env(safe-area-inset-bottom) work for the sticky bar
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${hindi.variable} ${display.variable} ${caps.variable} ${sans.variable} ${logo.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-poster font-sans text-cream antialiased" suppressHydrationWarning>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
