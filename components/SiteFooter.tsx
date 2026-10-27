import Image from "next/image";
import { site } from "@/lib/config";

// One-line footer (the WhatsApp / Instagram links already sit under the form),
// plus the credit line the CC-licensed stock photos require.
// Extra bottom padding on phones clears the sticky CTA bar.
export default function SiteFooter() {
  return (
    <footer className="border-t-4 border-marigold bg-night pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
      <div className="container-px flex items-center justify-center gap-3">
        <Image src="/logo.jpg" alt="Disconnect logo" width={32} height={32} sizes="32px" className="h-8 w-8 rounded-full border-2 border-marigold object-cover" />
        <p className="text-[11.5px] text-cream/70 min-[380px]:text-[12.5px] sm:text-[13px]">© 2026 {site.fullName}</p>
      </div>
      <p className="container-px mt-2 text-center text-[10.5px] leading-relaxed text-cream/45">
        Stock photos via Wikimedia Commons:{" "}
        {site.photoCredits.map((c, i) => (
          <span key={c.url}>
            {i > 0 && " · "}
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline decoration-cream/30 underline-offset-2 hover:text-cream/80">
              {c.what}, {c.by}
            </a>{" "}
            ({c.license})
          </span>
        ))}
      </p>
    </footer>
  );
}
