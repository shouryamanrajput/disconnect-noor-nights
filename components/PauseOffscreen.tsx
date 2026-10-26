"use client";

import { useEffect } from "react";

// Pauses every CSS animation inside a section while it is off screen
// (adds .anim-off, see globals.css), so phones only animate what you can see.
export default function PauseOffscreen() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = document.querySelectorAll<HTMLElement>("main > section, footer");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("anim-off", !e.isIntersecting)),
      { rootMargin: "150px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
