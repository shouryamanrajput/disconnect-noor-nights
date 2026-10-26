"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Gentle scroll reveal. Content is fully visible in the server HTML (nothing
// waits for JavaScript); after hydration, blocks that are still below the
// fold are tucked away and eased in as they scroll into view. Skipped for
// visitors who prefer reduced motion. CSS lives in globals.css (.rv-*).
export default function Reveal({
  children,
  delay = 0,
  y = 22,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen (or above it)? Leave it alone, no flash.
    if (el.getBoundingClientRect().top < window.innerHeight - 60) return;
    el.style.setProperty("--rv-y", `${y}px`);
    el.style.setProperty("--rv-delay", `${delay}s`);
    el.classList.add("rv-hide");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("rv-in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay, y]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
