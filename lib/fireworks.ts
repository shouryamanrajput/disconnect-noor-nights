// Tiny dependency-free canvas firework: rocket streak → radial burst with
// gravity, fade and twinkle → crackles, plus marigold petals. ~1.6s total.
// A full-viewport fixed canvas (pointer-events: none) is created per burst
// and removed afterwards. Reduced motion: a small sparkle only.

type Kind = "spark" | "crackle" | "petal" | "ember";
type Part = {
  x: number; y: number; vx: number; vy: number;
  px: number; py: number;
  age: number; life: number;
  color: string; size: number; kind: Kind;
  rot: number; vr: number; tw: number; drag: number; g: number;
};

const SPARK = ["#FFD43B", "#FFB000", "#FF8A1F", "#FF5FB0", "#FF3D8B", "#B98CFF", "#FFF3C9"];
const PETAL = ["#FF8A1F", "#FFA51B", "#FFC93B", "#FF7A00"];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];

export function launchFireworks(originX: number, originY: number) {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth;
  const H = window.innerHeight;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.fireworks = "1";
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: `${W}px`, height: `${H}px`, pointerEvents: "none", zIndex: "9999" });
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  ctx.scale(dpr, dpr);

  const parts: Part[] = [];
  const add = (p: Partial<Part> & { x: number; y: number }) =>
    parts.push({ vx: 0, vy: 0, px: p.x, py: p.y, age: 0, life: 1, color: "#FFD43B", size: 2, kind: "spark", rot: 0, vr: 0, tw: Math.random() * 6, drag: 0.985, g: 0, ...p });

  const burst = (x: number, y: number, n: number, speed: number, life: number, kind: Kind = "spark") => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.08, 0.08);
      const s = speed * rnd(0.45, 1);
      add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: life * rnd(0.7, 1.1), color: pick(SPARK), size: rnd(1.8, 3.2), kind, g: 300, drag: 0.972 });
    }
  };

  const TOTAL = reduce ? 600 : 1700;
  let rocket: { x: number; y: number; tx: number; ty: number; t: number; dur: number } | null = null;
  let crackles = reduce ? 0 : 4;

  if (reduce) {
    for (let i = 0; i < 10; i++) add({ x: originX + rnd(-40, 40), y: originY + rnd(-18, 18), life: rnd(0.3, 0.55), size: rnd(1.5, 2.5), kind: "crackle", color: pick(SPARK) });
  } else {
    // apex ~220px above the button, kept on screen
    const ty = Math.max(90, originY - rnd(190, 250));
    const tx = Math.min(W - 60, Math.max(60, originX + rnd(-40, 40)));
    rocket = { x: originX, y: originY, tx, ty, t: 0, dur: 0.3 };
    // pop of sparkles at the button + marigold petals
    for (let i = 0; i < 14; i++) {
      const a = rnd(0, Math.PI * 2);
      add({ x: originX, y: originY, vx: Math.cos(a) * rnd(60, 180), vy: Math.sin(a) * rnd(60, 180), life: rnd(0.3, 0.6), size: rnd(1.2, 2), color: pick(SPARK), drag: 0.92 });
    }
    for (let i = 0; i < 26; i++) {
      add({ x: originX + rnd(-30, 30), y: originY, vx: rnd(-220, 220), vy: rnd(-460, -200), life: rnd(1.1, 1.6), size: rnd(4, 7), kind: "petal", color: pick(PETAL), rot: rnd(0, 6.28), vr: rnd(-8, 8), g: 620, drag: 0.975 });
    }
  }

  let last = performance.now();
  const start = last;
  let raf = 0;
  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const el = now - start;
    ctx.clearRect(0, 0, W, H);

    if (rocket) {
      rocket.t += dt;
      const k = Math.min(1, rocket.t / rocket.dur);
      const e = 1 - Math.pow(1 - k, 2);
      const x = originX + (rocket.tx - originX) * e;
      const y = originY + (rocket.ty - originY) * e;
      add({ x, y, vx: rnd(-20, 20), vy: rnd(10, 60), life: rnd(0.25, 0.45), size: rnd(1, 1.8), kind: "ember", color: pick(["#FFF3C9", "#FFD43B", "#FF8A1F"]), drag: 0.9 });
      rocket.x = x; rocket.y = y;
      if (k >= 1) {
        burst(x, y, 84, 540, 1.1);
        burst(x, y, 28, 300, 0.95);
        for (let i = 0; i < 16; i++) add({ x, y, vx: rnd(-120, 120), vy: rnd(-120, 120), life: rnd(0.15, 0.3), size: rnd(2, 3.5), kind: "crackle", color: "#FFF8E1", drag: 0.9 });
        rocket = null;
      }
    }
    if (!rocket && crackles > 0 && el > 600 + (4 - crackles) * 110) {
      const sparks = parts.filter((p) => p.kind === "spark");
      const s = sparks.length ? pick(sparks) : null;
      if (s) for (let i = 0; i < 9; i++) add({ x: s.x, y: s.y, vx: rnd(-90, 90), vy: rnd(-90, 90), life: rnd(0.18, 0.32), size: rnd(1, 1.8), kind: "crackle", color: "#FFF8E1", drag: 0.9 });
      crackles--;
    }

    ctx.globalCompositeOperation = "lighter";
    for (const p of parts) {
      p.age += dt;
      p.px = p.x; p.py = p.y;
      const d = Math.pow(p.drag, dt * 60);
      p.vx *= d; p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const lifeK = p.age / p.life;
      if (lifeK >= 1 || p.kind === "petal") continue;
      let a = 1 - lifeK;
      if (lifeK > 0.45) a *= 0.55 + 0.45 * Math.sin(p.tw + p.age * 38); // twinkle
      ctx.globalAlpha = Math.max(0, a);
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      if (p.kind === "spark" || p.kind === "ember") {
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.px - (p.x - p.px) * 2, p.py - (p.y - p.py) * 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        const r = p.size * 2.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x + r * 0.25, p.y - r * 0.25); ctx.lineTo(p.x + r, p.y);
        ctx.lineTo(p.x + r * 0.25, p.y + r * 0.25); ctx.lineTo(p.x, p.y + r); ctx.lineTo(p.x - r * 0.25, p.y + r * 0.25);
        ctx.lineTo(p.x - r, p.y); ctx.lineTo(p.x - r * 0.25, p.y - r * 0.25); ctx.closePath(); ctx.fill();
      }
    }
    if (rocket) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#FFF8E1";
      ctx.beginPath(); ctx.arc(rocket.x, rocket.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    for (const p of parts) {
      if (p.kind !== "petal" || p.age >= p.life) continue;
      const lifeK = p.age / p.life;
      ctx.globalAlpha = lifeK > 0.7 ? (1 - lifeK) / 0.3 : 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(p.rot * 1.3)));
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].age >= parts[i].life) parts.splice(i, 1);

    if (el < TOTAL && (parts.length || rocket)) raf = requestAnimationFrame(frame);
    else { cancelAnimationFrame(raf); canvas.remove(); }
  };
  raf = requestAnimationFrame(frame);
}
