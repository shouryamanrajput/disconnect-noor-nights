"use client";

import type { MouseEvent, ReactNode } from "react";
import { site } from "@/lib/config";
import { launchFireworks } from "@/lib/fireworks";
import { scrollToRegister } from "@/lib/scroll";
import { EnvelopeIcon } from "@/components/Icons";

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// Every "Request an invite" button: fires a firecracker burst from the
// button and smooth-scrolls to the on-page registration form (#register).
export default function InviteButton({ className = "", icon = true, iconClass = "h-4 w-4", short = false, children }: { className?: string; icon?: boolean; iconClass?: string; short?: boolean; children?: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    launchFireworks(r.left + r.width / 2, r.top + r.height / 2);
    scrollToRegister();
  };
  // Registrations closed: a calm outlined pill (no fireworks) that scrolls to
  // the "Registrations are closed" card.
  if (!site.registrationsOpen) {
    const onClosedClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      scrollToRegister();
    };
    return (
      <a href="#register" onClick={onClosedClick} className={`btn-outline whitespace-nowrap !shadow-none hover:bg-plum/30 hover:text-marigold max-[359px]:px-3 max-[359px]:text-[14px] ${className}`}>
        {icon && <LockIcon className={`${iconClass} shrink-0`} />}
        {short ? (
          <>
            <span className="min-[380px]:hidden">Closed</span>
            <span className="max-[379px]:hidden">{site.ctas.closed}</span>
          </>
        ) : (
          site.ctas.closed
        )}
      </a>
    );
  }
  return (
    <a href="#register" onClick={onClick} className={`btn-primary btn-spark ${className}`}>
      {icon && <EnvelopeIcon className={`${iconClass} shrink-0 text-plum`} />}
      {children ?? site.ctas.primary}
    </a>
  );
}
