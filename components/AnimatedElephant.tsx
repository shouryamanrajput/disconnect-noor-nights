"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// The poster elephant as two layers: body + trunk (trunk pivots at its root).
// Trunk motion = scroll-linked curl (position + velocity, springy) + an idle
// swing every ~1s (up, back, pause). Slight head bob follows. Reduced motion:
// static. Left elephant faces right; the right one is its mirror.
// Plain requestAnimationFrame + a spring (no animation library), so the
// page ships ~45 KB less JavaScript. Pauses while hidden (e.g. desktop pair on
// phones) or scrolled off screen (IntersectionObserver); writes transform only.
const W = 272;
const H = 261;
const PIVOT_X = 190 / W; // trunk root in the left-facing art
const PIVOT_Y = 182 / H;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function AnimatedElephant({ side, className = "", sizes = "280px", phase = 0, priority = false }: { side: "left" | "right"; className?: string; sizes?: string; phase?: number; priority?: boolean }) {
  const headRef = useRef<HTMLDivElement>(null);
  const trunkRef = useRef<HTMLDivElement>(null);
  const dir = side === "left" ? 1 : -1; // CSS rotate sign flips for the mirror

  useEffect(() => {
    const head = headRef.current;
    const trunk = trunkRef.current;
    if (!head || !trunk) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    let vel = 0; // scroll velocity, px/s (smoothed)
    let x = 0; // spring position (degrees)
    let v = 0; // spring velocity
    let visible = true;
    const tick = (t: number) => {
      if (!visible) return; // offscreen: stop the loop until it scrolls back
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.033, Math.max(0.001, (t - last) / 1000));
      last = t;
      if (mq.matches || head.offsetParent === null) return; // reduced motion / not displayed
      const y = window.scrollY;
      vel += ((y - lastY) / dt - vel) * 0.25;
      lastY = y;
      const target = Math.sin(y / 240) * 7 + clamp(vel / 160, -7, 7);
      // spring: stiffness 110, damping 16, mass 0.7
      v += ((-110 * (x - target) - 16 * v) / 0.7) * dt;
      x += v * dt;
      const u = ((t + phase) % 2200) / 1000; // 1.2s swing (up + back) then ~1s pause
      const idle = u < 1.2 ? -9 * Math.sin((Math.PI * u) / 1.2) : 0;
      const a = clamp(x + idle, -12, 14);
      trunk.style.transform = `rotate(${(a * dir).toFixed(2)}deg)`;
      head.style.transform = `translateY(${(a * 0.18).toFixed(2)}px) rotate(${(a * 0.08 * dir).toFixed(2)}deg)`;
    };
    raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) {
        last = performance.now();
        lastY = window.scrollY;
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(head);
    const onMq = () => {
      if (mq.matches) {
        trunk.style.transform = "";
        head.style.transform = "";
      }
    };
    mq.addEventListener("change", onMq);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, [dir, phase]);

  const body = `/elephant-body-${side}.png`;
  const trunkSrc = `/elephant-trunk-${side}.png`;
  const origin = `${(side === "left" ? PIVOT_X : 1 - PIVOT_X) * 100}% ${PIVOT_Y * 100}%`;
  const img = "pointer-events-none select-none h-auto w-full";

  return (
    <div ref={headRef} aria-hidden className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative "}will-change-transform ${className}`} style={{ transformOrigin: side === "left" ? "10% 50%" : "90% 50%" }}>
      <Image src={body} alt="" width={W} height={H} sizes={sizes} priority={priority} className={img} />
      <div ref={trunkRef} className="absolute inset-0" style={{ transformOrigin: origin }}>
        <Image src={trunkSrc} alt="" width={W} height={H} sizes={sizes} priority={priority} className={img} />
      </div>
    </div>
  );
}
