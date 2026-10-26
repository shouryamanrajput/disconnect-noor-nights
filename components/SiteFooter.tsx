import Image from "next/image";
import { site } from "@/lib/config";

// Slim footer: logo, two links, copyright. Extra bottom padding on phones
// clears the sticky CTA bar.
export default function SiteFooter() {
  return (
    <footer className="border-t-4 border-marigold bg-night pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:pb-6">
      <div className="container-px flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          <Image src="/logo.jpg" alt="Disconnect logo" width={40} height={40} sizes="40px" className="h-10 w-10 rounded-full border-2 border-marigold object-cover" />
          <p className="text-[13px] text-cream/70">© 2026 {site.fullName}</p>
        </div>
        <div className="flex gap-2 text-[15px] font-semibold">
          <a href={site.links.instagram} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center px-2 text-cream/85 hover:text-marigold">Instagram {site.handle}</a>
          <a href={site.links.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center px-2 text-cream/85 hover:text-marigold">WhatsApp</a>
        </div>
      </div>
    </footer>
  );
}
