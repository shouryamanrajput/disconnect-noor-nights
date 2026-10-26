import type { Metadata, Viewport } from "next";
import { Laila, Amarante, Montserrat, PT_Serif, Fraunces } from "next/font/google";
import localFont from "next/font/local";
import { preload } from "react-dom";
import "./globals.css";
import { site } from "@/lib/config";
import SmoothScroll from "@/components/SmoothScroll";
import PauseOffscreen from "@/components/PauseOffscreen";

// Fonts matched against the poster (see shots/font-compare.png):
// "दिवाली" → Laila Bold (heavy Devanagari with cut, flared terminals)
// The hero title only needs the 6 letters of "दिवाली": a 1 KB subset of Laila
// Bold (app/fonts, made with fonttools pyftsubset, OFL font) is preloaded
// instead of the 43 KB full Devanagari file. If site.hero.hindiTitle is ever
// changed to other letters, the full Laila Bold below fills in automatically
// (unicode-range), it is just not preloaded.
const hindiTitle = localFont({
  src: "./fonts/laila-700-diwali.woff2",
  weight: "700",
  variable: "--font-hindi-title",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0926, U+0932, U+0935, U+093E-0940" }],
});
const hindi = Laila({ subsets: ["devanagari"], weight: "700", variable: "--font-hindi", display: "swap", preload: false });
// "HOUSE PARTY" + section titles → Amarante (condensed flared festive display)
const display = Amarante({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
// "5:30 PM ONWARDS", "DRESS LIKE YOU ARE…" → PT Serif (classic book-serif caps)
const caps = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-caps", display: "swap" });
// "OCT 31ST, 2026", "OMAXE, ROHTAK", "INVITE-ONLY" + body → Montserrat (bold geometric sans)
const sans = Montserrat({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// "disconnect" wordmark → Fraunces Black, soft (chunky rounded serif)
// Small header/footer wordmark only, so it is not preloaded (keeps the hero fonts first in line).
const logo = Fraunces({ subsets: ["latin"], axes: ["SOFT"], variable: "--font-logo", display: "swap", preload: false });

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
  viewportFit: "cover", // lets env(safe-area-inset-*) work on notched phones
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // paper textures used by the hero/background (fetched early, tiny tiles)
  preload("/tex/grain.webp", { as: "image", fetchPriority: "high" });
  preload("/tex/wash.webp", { as: "image", fetchPriority: "high" });
  return (
    <html
      lang="en"
      className={`${hindiTitle.variable} ${hindi.variable} ${display.variable} ${caps.variable} ${sans.variable} ${logo.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-poster font-sans text-cream antialiased" suppressHydrationWarning>
        <SmoothScroll />
        <PauseOffscreen />
        {children}
      </body>
    </html>
  );
}
