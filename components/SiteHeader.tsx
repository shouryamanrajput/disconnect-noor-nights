"use client";

import Image from "next/image";
import { site } from "@/lib/config";
import InviteButton from "@/components/InviteButton";

const nav = [
  { href: "#deets", label: "The deets" },
  { href: "#dress-code", label: "Dress code" },
  { href: "#register", label: "Request" },
];

// Fixed, always-solid deep purple header (as in the banner).
export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] border-b border-marigold/25 bg-plum shadow-[0_4px_20px_rgba(20,2,40,0.35)]">
      <div className="container-px flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
        <a href="#top" className="flex min-h-[44px] min-w-0 items-center gap-2.5">
          <Image src="/logo.jpg" alt="Disconnect logo" width={36} height={36} sizes="36px" priority className="h-9 w-9 shrink-0 rounded-full border-2 border-marigold object-cover" />
          <span className="min-w-0 leading-tight">
            <span className="wordmark block truncate text-[1.12rem] sm:text-[1.35rem] lowercase leading-none">{site.name}</span>
            <span className="hidden truncate mt-0.5 text-[11px] min-[400px]:block font-bold uppercase tracking-[0.14em] text-marigold/85 sm:tracking-[0.2em]">Diwali House Party</span>
          </span>
        </a>
        <nav className="hidden items-center lg:flex">
          {nav.map((n, i) => (
            <span key={n.href} className="flex items-center">
              {i > 0 && <span aria-hidden className="mx-4 h-4 w-px bg-marigold/40" />}
              <a href={n.href} className="text-sm font-semibold text-cream/90 transition-colors hover:text-marigold">
                {n.label}
              </a>
            </span>
          ))}
        </nav>
        <InviteButton className="min-h-[44px] shrink-0 gap-1.5 px-3 py-2 text-[13px] max-[379px]:[&_svg]:hidden min-[380px]:px-3.5 min-[380px]:text-[13.5px] shadow-[0_3px_0_#356428] sm:px-5 sm:py-2.5 sm:text-sm" />
      </div>
    </header>
  );
}
