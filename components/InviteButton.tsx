"use client";

import type { MouseEvent, ReactNode } from "react";
import { site } from "@/lib/config";
import { launchFireworks } from "@/lib/fireworks";
import { scrollToRegister } from "@/lib/scroll";
import { EnvelopeIcon } from "@/components/Icons";

// Every "Request an invite" button: fires a firecracker burst from the
// button and smooth-scrolls to the on-page registration form (#register).
export default function InviteButton({ className = "", icon = true, iconClass = "h-4 w-4", children }: { className?: string; icon?: boolean; iconClass?: string; children?: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    launchFireworks(r.left + r.width / 2, r.top + r.height / 2);
    scrollToRegister();
  };
  return (
    <a href="#register" onClick={onClick} className={`btn-primary btn-spark ${className}`}>
      {icon && <EnvelopeIcon className={`${iconClass} shrink-0 text-plum`} />}
      {children ?? site.ctas.primary}
    </a>
  );
}
