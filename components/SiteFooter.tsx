import Image from "next/image";
import { site } from "@/lib/config";

// One-line footer (the WhatsApp / Instagram links already sit under the form).
// Extra bottom padding on phones clears the sticky CTA bar.
export default function SiteFooter() {
  return (
    <footer className="border-t-4 border-marigold bg-night pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
      <div className="container-px flex items-center justify-center gap-3">
        <Image src="/logo.jpg" alt="Disconnect logo" width={32} height={32} sizes="32px" className="h-8 w-8 rounded-full border-2 border-marigold object-cover" />
        <p className="text-[13px] text-cream/70">© 2026 {site.fullName}</p>
      </div>
    </footer>
  );
}
