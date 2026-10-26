"use client";

import type { MouseEvent, ReactNode } from "react";
import { registerHref, site } from "@/lib/config";
import { launchFireworks } from "@/lib/fireworks";
import { EnvelopeIcon } from "@/components/Icons";

// Every "Request an invite" button: opens the register link in a new tab
// right away (inside the click, so popup blockers allow it) and fires a
// firecracker burst from the button on this page.
export default function InviteButton({ className = "", icon = true, iconClass = "h-4 w-4", children }: { className?: string; icon?: boolean; iconClass?: string; children?: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let the browser handle new-tab clicks
    e.preventDefault();
    window.open(registerHref, "_blank", "noopener,noreferrer");
    const r = e.currentTarget.getBoundingClientRect();
    launchFireworks(r.left + r.width / 2, r.top + r.height / 2);
  };
  return (
    <a href={registerHref} target="_blank" rel="noreferrer" onClick={onClick} className={`btn-primary btn-spark ${className}`}>
      {icon && <EnvelopeIcon className={`${iconClass} shrink-0 text-plum`} />}
      {children ?? site.ctas.primary}
    </a>
  );
}
