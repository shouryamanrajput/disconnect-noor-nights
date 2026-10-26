"use client";

import { useEffect } from "react";

// Pauses every CSS animation inside a section while it is off screen
// (adds .anim-off, see globals.css), plus each [data-pause] decor piece on its
// own, so phones only animate what you can see.
export default function PauseOffscreen() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const toggle = (entries: IntersectionObserverEntry[]) => entries.forEach((e) => e.target.classList.toggle("anim-off", !e.isIntersecting));
    // whole sections (a little ahead of the viewport) …
    const io = new IntersectionObserver(toggle, { rootMargin: "150px 0px" });
    document.querySelectorAll<HTMLElement>("main > section, footer").forEach((el) => io.observe(el));
    // … and individual decor pieces marked data-pause (tight), so only what is
    // actually on screen animates.
    const io2 = new IntersectionObserver(toggle, { rootMargin: "40px 0px" });
    document.querySelectorAll<HTMLElement>("[data-pause]").forEach((el) => io2.observe(el));
    return () => { io.disconnect(); io2.disconnect(); };
  }, []);
  return null;
}
