"use client";

import { useEffect } from "react";

// Adds gentle momentum scrolling for a calmer feel. Respects users who
// prefer reduced motion, and is skipped on touch devices (native scroll).
// Lenis is loaded on demand, so phones never download it.
export default function SmoothScroll() {
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    if (prefersReduced || touch) return;

    let lenis: import("lenis").default | null = null;
    let frame = 0;
    let dead = false;
    import("lenis").then(({ default: Lenis }) => {
      if (dead) return;
      lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      });
      (window as unknown as { __lenis?: unknown }).__lenis = lenis;
      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      delete (window as unknown as { __lenis?: unknown }).__lenis;
      lenis?.destroy();
    };
  }, []);

  return null;
}
