"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/config";
import InviteButton from "@/components/InviteButton";
import WhatsAppIcon from "@/components/WhatsAppIcon";

// Sticky bottom bar on phones with the one action that matters.
export default function MobileCTABar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 500);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t-2 border-marigold/60 bg-plum px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-300 sm:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base text-marigold">Diwali House Party</p>
          <p className="truncate text-[12px] text-cream/80">Sat 31 Oct · Rohtak</p>
        </div>
        <a href={site.links.whatsapp} target="_blank" rel="noreferrer" aria-label={site.ctas.whatsapp} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-marigold/70 text-marigold">
          <WhatsAppIcon className="h-5 w-5" />
        </a>
        <InviteButton iconClass="h-4 w-4" className="min-h-[44px] shrink-0 gap-1.5 px-4 py-2.5 text-[14px] shadow-[0_4px_0_#c98e00]" />
      </div>
    </div>
  );
}
