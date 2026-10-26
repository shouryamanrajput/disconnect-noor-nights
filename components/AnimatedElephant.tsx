"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";

// The poster elephant as two layers: body + trunk (trunk pivots at its root).
// Trunk motion = scroll-linked curl (position + velocity, springy) + an idle
// swing every ~1s (up, back, pause). Slight head bob follows. Reduced motion:
// static. Left elephant faces right; the right one is its mirror.
const W = 272;
const H = 261;
const PIVOT_X = 190 / W; // trunk root in the left-facing art
const PIVOT_Y = 182 / H;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function AnimatedElephant({ side, className = "", sizes = "280px", phase = 0, priority = false }: { side: "left" | "right"; className?: string; sizes?: string; phase?: number; priority?: boolean }) {
  const reduce = useReducedMotion();
  const dir = side === "left" ? 1 : -1; // CSS rotate sign flips for the mirror

  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  // angle in "left-facing" terms: negative = trunk up, positive = curled down
  const scrollAngle = useTransform([scrollY, vel] as const, ([y, v]: number[]) => Math.sin(y / 240) * 7 + clamp(v / 160, -7, 7));
  const scrollSpring = useSpring(scrollAngle, { stiffness: 110, damping: 16, mass: 0.7 });
  const idle = useMotionValue(0);
  const enabled = useMotionValue(1); // 0 = reduced motion → static
  useEffect(() => enabled.set(reduce ? 0 : 1), [reduce, enabled]);

  useAnimationFrame((t) => {
    if (reduce) return;
    const cycle = 2200; // 1.2s swing (up + back) then ~1s pause
    const u = ((t + phase) % cycle) / 1000;
    idle.set(u < 1.2 ? -9 * Math.sin((Math.PI * u) / 1.2) : 0);
  });

  const angle = useTransform([scrollSpring, idle, enabled] as const, ([s, i, e]: number[]) => e * clamp(s + i, -12, 14));
  const trunkRotate = useTransform(angle, (a) => a * dir);
  const headY = useTransform(angle, (a) => a * 0.18);
  const headRotate = useTransform(angle, (a) => a * 0.08 * dir);

  const body = `/elephant-body-${side}.png`;
  const trunk = `/elephant-trunk-${side}.png`;
  const origin = `${(side === "left" ? PIVOT_X : 1 - PIVOT_X) * 100}% ${PIVOT_Y * 100}%`;
  const img = "pointer-events-none select-none h-auto w-full";

  return (
    <motion.div aria-hidden className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative "}${className}`} style={{ y: headY, rotate: headRotate, transformOrigin: side === "left" ? "10% 50%" : "90% 50%" }}>
      <Image src={body} alt="" width={W} height={H} sizes={sizes} priority={priority} className={img} />
      <motion.div className="absolute inset-0" style={{ rotate: trunkRotate, transformOrigin: origin }}>
        <Image src={trunk} alt="" width={W} height={H} sizes={sizes} priority={priority} className={img} />
      </motion.div>
    </motion.div>
  );
}
