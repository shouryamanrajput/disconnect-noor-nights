// Hand-built festive decor (SVG + CSS) matching the Diwali banner reference:
// marigold toran with strands, fairy lights, disco balls, clay diyas,
// marigold flowers, lotus ornaments, rangoli glow and the jharokha arch.

type P = { className?: string; style?: React.CSSProperties };

/* ── Marigold bead (garland) ─────────────────────────────── */
function Bead({ cx, cy, r = 7, tone = "#FFB000" }: { cx: number; cy: number; r?: number; tone?: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={tone} />
      <circle cx={cx} cy={cy} r={r * 0.66} fill="#FFC93B" />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="#E86A00" />
    </g>
  );
}

/* ── Toran: swags of marigolds; `full` adds hanging strands + fairy lights ── */
export function Toran({ className = "", full = false }: P & { full?: boolean }) {
  const W = 1440;
  const swags = full ? 9 : 8;
  const seg = W / swags;
  const beads: { x: number; y: number; t: string }[] = [];
  for (let s = 0; s < swags; s++) {
    const n = full ? 14 : 12;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      beads.push({ x: s * seg + t * seg, y: (full ? 12 : 10) + Math.sin(Math.PI * t) * (full ? 30 : 22), t: i % 2 ? "#FF8A1F" : "#FFA51B" });
    }
  }
  if (!full) {
    return (
      <svg viewBox="0 0 1440 52" preserveAspectRatio="xMidYMin slice" aria-hidden className={`pointer-events-none h-[34px] w-full sm:h-[44px] ${className}`}>
        <rect x="0" y="0" width="1440" height="4" fill="#2C821B" />
        {beads.map((b, i) => <Bead key={i} cx={b.x} cy={b.y} r={6.5} tone={b.t} />)}
      </svg>
    );
  }
  // hanging marigold strands (x positions follow the reference: ~15%, 71%, 87%)
  const strands = [{ x: 216, n: 4 }, { x: 1022, n: 5 }, { x: 1253, n: 4 }];
  // fairy-light drops: thin wires with tiny warm bulbs
  const lights = [40, 128, 300, 372, 470, 610, 690, 830, 905, 1110, 1180, 1330, 1405];
  return (
    <svg viewBox="0 0 1440 200" aria-hidden className={`pointer-events-none h-auto w-full ${className}`}>
      <defs>
        <filter id="bulb-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {lights.map((x, i) => {
        const len = 70 + ((i * 37) % 80);
        const bulbs = 3 + (i % 3);
        return (
          <g key={x} opacity={0.9}>
            <line x1={x} y1={20} x2={x} y2={20 + len} stroke="#8a4a2a" strokeOpacity="0.5" strokeWidth="0.8" />
            {Array.from({ length: bulbs }).map((_, j) => {
              const y = 32 + (j * len) / bulbs;
              return (
                <g key={j} className="animate-twinkle" style={{ animationDelay: `${(i * 0.37 + j * 0.6) % 3}s` }}>
                  <circle cx={x} cy={y} r={5} fill="#FFC861" opacity="0.55" filter="url(#bulb-glow)" />
                  <circle cx={x} cy={y} r={1.6} fill="#FFF1C2" />
                </g>
              );
            })}
          </g>
        );
      })}
      {strands.map((s) => (
        <g key={s.x}>
          <line x1={s.x} y1={14} x2={s.x} y2={30 + s.n * 15} stroke="#C98E00" strokeWidth="1.2" />
          {Array.from({ length: s.n }).map((_, i) => <Bead key={i} cx={s.x} cy={34 + i * 15} r={6.5} tone={i % 2 ? "#FF8A1F" : "#FFA51B"} />)}
          <path d={`M${s.x} ${30 + s.n * 15} q-14 4 -16 20 q12 -2 16 -20Z`} fill="#2C821B" />
          <path d={`M${s.x} ${30 + s.n * 15} q14 4 16 20 q-12 -2 -16 -20Z`} fill="#3DB356" />
          <Bead cx={s.x} cy={48 + s.n * 15} r={7} tone="#FF8A1F" />
          <Bead cx={s.x} cy={63 + s.n * 15} r={5.5} tone="#FFA51B" />
        </g>
      ))}
      <rect x="0" y="0" width="1440" height="5" fill="#2C821B" />
      {Array.from({ length: 48 }).map((_, i) => (
        <path key={i} d={`M${i * 30 + 15} 3 q-7 9 0 18 q7 -9 0 -18Z`} fill={i % 2 ? "#2C821B" : "#3DB356"} />
      ))}
      {beads.map((b, i) => <Bead key={i} cx={b.x} cy={b.y + 4} r={8.5} tone={b.t} />)}
    </svg>
  );
}

/* ── Rotating mirror disco ball on a string ────────────────
   Pure CSS, no canvas, ~8 animated elements per ball. The sphere is
   split into latitude bands; each band is squashed by cos(latitude) and
   holds a strip of mirror tiles (a tiny SVG pattern) that scrolls
   sideways one pattern-length per loop (globals.css → disco-strip), so
   tile columns slide across the circular mask and narrow toward the
   poles. Static shading on top (key light top-left, limb + rim shadow)
   sells the curvature. Bling: tiles near the light flash white/gold,
   4-point star glints pop on the edge, a pink/gold halo pulses.
   Reduced motion: frozen, halo only. */
const TILE = ["#EEE3FF", "#D9C3F7", "#B892E6", "#F6B7D6", "#FFD98A", "#FFFFFF", "#8E68BE", "#C7B2EA", "#F2A5C8", "#6E4C9C"];
const REPEAT = 8; // tiles per pattern repeat
function seeded(seed: number) {
  let x = (seed * 7919) % 233280;
  return () => (x = (x * 9301 + 49297) % 233280) / 233280;
}
function tileStrip(r: () => number) {
  const rects = Array.from({ length: REPEAT }, (_, i) => `<rect x='${i * 10 + 0.6}' y='0.8' width='8.8' height='8.4' fill='${TILE[Math.floor(r() * TILE.length)]}'/>`).join("");
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${REPEAT * 10} 10' preserveAspectRatio='none'>${rects}</svg>`)}")`;
}

function Sphere({ size, rows, cols, period, delay, seed }: { size: number; rows: number; cols: number; period: number; delay: number; seed: number }) {
  const r = seeded(seed);
  const R = size / 2;
  const tileW = (2 * Math.PI * R) / cols;
  const L = tileW * REPEAT; // one pattern repeat in px (at the equator)
  const loop = (period * REPEAT) / cols; // seconds to scroll one repeat
  const flashes = Array.from({ length: 5 }, () => ({ x: 18 + r() * 40, y: 14 + r() * 44, d: r() * 3.2, gold: r() < 0.45 }));
  return (
    <div className="disco-ball absolute inset-0 overflow-hidden rounded-full">
      {Array.from({ length: rows }, (_, k) => {
        const hi = 90 - (180 / rows) * k;
        const lo = hi - 180 / rows;
        const top = R * (1 - Math.sin((hi * Math.PI) / 180));
        const h = R * (1 - Math.sin((lo * Math.PI) / 180)) - top;
        const sx = Math.cos((((hi + lo) / 2) * Math.PI) / 180);
        return (
          <div key={k} className="absolute inset-x-0" style={{ top, height: h + 0.3, transform: `scaleX(${sx.toFixed(3)})` }}>
            <div
              className="disco-strip absolute inset-y-0"
              style={{
                left: -L * (k % 2 ? 0.5 / REPEAT : 0) - L,
                width: size + 2 * L,
                backgroundImage: tileStrip(r),
                backgroundSize: `${L}px 100%`,
                ["--l" as string]: `${L}px`,
                animationDuration: `${loop}s`,
                animationDelay: `${-(delay + r() * 0.0001)}s`,
              }}
            />
          </div>
        );
      })}
      {flashes.map((f, i) => (
        <span key={i} className="disco-flash absolute rounded-[1px]" style={{ left: `${f.x}%`, top: `${f.y}%`, width: tileW * 0.8, height: tileW * 0.7, background: f.gold ? "#FFE27A" : "#FFFFFF", boxShadow: `0 0 ${Math.round(tileW)}px ${f.gold ? "#FFD43B" : "#FFFFFF"}`, animationDelay: `-${(f.d + delay).toFixed(2)}s` }} />
      ))}
      <div className="disco-shade absolute inset-0 rounded-full" />
    </div>
  );
}

const Star = ({ className = "", style }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} style={style}>
    <path d="M12 0c.7 6.6 4.7 10.6 12 12-7.3 1.4-11.3 5.4-12 12-.7-6.6-4.7-10.6-12-12C7.3 10.6 11.3 6.6 12 0Z" fill="#FFFFFF" />
  </svg>
);

export function DiscoBall({ className = "", size = 64, string = 40, delay = 0, period = 5, seed = 1, specks = true }: P & { size?: number; string?: number; delay?: number; period?: number; seed?: number; specks?: boolean }) {
  const g = Math.max(10, size * 0.32); // glint size
  return (
    <div aria-hidden className={`animate-sway pointer-events-none flex flex-col items-center ${className}`} style={{ animationDelay: `${-delay}s` }}>
      <div style={{ height: string }} className="w-px bg-marigold/70" />
      <div className="h-1.5 w-3 rounded-sm bg-gradient-to-b from-[#FFE38A] to-gold" style={{ width: Math.max(8, size * 0.22) }} />
      <div className="relative" style={{ width: size, height: size }}>
        {/* pulsing pink/gold halo */}
        <div className="disco-halo absolute -inset-[70%] rounded-full" style={{ animationDelay: `${-delay}s` }} />
        {/* sphere */}
        <Sphere size={size} rows={size < 36 ? 7 : 10} cols={size < 36 ? 12 : 20} period={period} delay={delay} seed={seed} />
        {/* edge glints */}
        <Star className="disco-glint absolute" style={{ width: g, height: g, left: "62%", top: "-6%", animationDuration: "1.4s", animationDelay: `${-delay * 0.7}s` }} />
        <Star className="disco-glint absolute" style={{ width: g * 0.8, height: g * 0.8, left: "-10%", top: "46%", animationDuration: "1.9s", animationDelay: `${-delay * 1.3 - 0.6}s` }} />
        <Star className="disco-glint absolute" style={{ width: g * 0.7, height: g * 0.7, left: "78%", top: "72%", animationDuration: "1.65s", animationDelay: `${-delay - 1.1}s` }} />
        {/* faint light specks drifting nearby */}
        {specks &&
          [
            [-1.4, 0.2, 0], [1.9, -0.1, 1.8], [-0.9, 1.5, 3.1], [1.5, 1.3, 4.2],
          ].map(([x, y, d], i) => (
            <span key={i} className="disco-speck absolute h-1 w-1 rounded-full bg-[#FFF1C9]" style={{ left: `${50 + x * 50}%`, top: `${50 + y * 50}%`, animationDelay: `${-(d + delay)}s` }} />
          ))}
      </div>
    </div>
  );
}

/* ── Marigold flower (top view) ─────────────────────────── */
export function MarigoldFlower({ cx, cy, r, warm = false }: { cx: number; cy: number; r: number; warm?: boolean }) {
  const rings = [
    { k: 1, n: 16, c: warm ? "#FF7A00" : "#FF9A14" },
    { k: 0.74, n: 13, c: warm ? "#FF9A14" : "#FFB321" },
    { k: 0.48, n: 10, c: "#FFC93B" },
  ];
  return (
    <g>
      {rings.map((ring) =>
        Array.from({ length: ring.n }).map((_, i) => {
          const a = (i / ring.n) * 360 + ring.k * 20;
          return <ellipse key={`${ring.k}-${i}`} cx={cx} cy={cy - r * ring.k * 0.55} rx={r * ring.k * 0.26} ry={r * ring.k * 0.5} fill={ring.c} stroke="#C85A00" strokeOpacity="0.35" strokeWidth="0.6" transform={`rotate(${a} ${cx} ${cy})`} />;
        }),
      )}
      <circle cx={cx} cy={cy} r={r * 0.16} fill="#C25A00" />
    </g>
  );
}

/* ── Clay diya (lit) for clusters ───────────────────────── */
function ClayDiya({ x, y, w, delay = 0, u }: { x: number; y: number; w: number; delay?: number; u: string }) {
  const h = w * 0.42;
  return (
    <g>
      <ellipse cx={x} cy={y - h * 1.1} rx={w * 0.55} ry={w * 0.55} fill={`url(#${u}g)`} className="animate-glow" style={{ transformOrigin: `${x}px ${y - h * 1.1}px`, animationDelay: `${delay}s` }} />
      <path className="animate-flicker" style={{ animationDelay: `${delay}s` }} d={`M${x} ${y - h * 2.3} C ${x + w * 0.1} ${y - h * 1.6}, ${x + w * 0.09} ${y - h * 1.05}, ${x} ${y - h * 0.82} C ${x - w * 0.09} ${y - h * 1.05}, ${x - w * 0.1} ${y - h * 1.6}, ${x} ${y - h * 2.3} Z`} fill={`url(#${u}f)`} />
      <path d={`M${x - w / 2} ${y - h * 0.7} Q${x} ${y - h * 0.95} ${x + w / 2} ${y - h * 0.7} Q${x + w * 0.44} ${y + h * 0.2} ${x} ${y + h * 0.25} Q${x - w * 0.44} ${y + h * 0.2} ${x - w / 2} ${y - h * 0.7}Z`} fill="#7E2A2E" />
      <ellipse cx={x} cy={y - h * 0.72} rx={w / 2} ry={h * 0.16} fill="#F5B700" />
      <ellipse cx={x} cy={y - h * 0.72} rx={w * 0.44} ry={h * 0.11} fill="#FFD27A" />
      <path d={`M${x - w * 0.4} ${y - h * 0.3} Q${x} ${y - h * 0.1} ${x + w * 0.4} ${y - h * 0.3}`} stroke="#C98E00" strokeWidth={w * 0.025} fill="none" strokeDasharray={`${w * 0.02} ${w * 0.06}`} strokeLinecap="round" />
    </g>
  );
}

function Leaf({ x, y, len, a, c = "#2F7A3A" }: { x: number; y: number; len: number; a: number; c?: string }) {
  return <path d={`M${x} ${y} q${len * 0.35} ${-len * 0.22} ${len} 0 q${-len * 0.55} ${len * 0.2} ${-len} 0Z`} fill={c} transform={`rotate(${a} ${x} ${y})`} />;
}

/* ── Bottom-corner cluster: diyas + marigolds + leaves ─────
   `side` mirrors it; `compact` = one diya + two flowers for phones. */
export function DiyaCluster({ className = "", side = "left", compact = false, uid }: P & { side?: "left" | "right"; compact?: boolean; uid: string }) {
  return (
    <svg viewBox={compact ? "0 0 160 120" : "0 0 320 230"} aria-hidden className={`pointer-events-none overflow-visible ${className}`} style={side === "right" ? { transform: "scaleX(-1)" } : undefined}>
      <defs>
        <radialGradient id={`${uid}g`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE58A" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#FF9A2E" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF8A1F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF8D6" />
          <stop offset="50%" stopColor="#FFD43B" />
          <stop offset="100%" stopColor="#FF7A00" />
        </linearGradient>
      </defs>
      {compact ? (
        <>
          <Leaf x={20} y={100} len={44} a={-150} />
          <Leaf x={60} y={110} len={40} a={-20} c="#3B8F45" />
          <ClayDiya x={92} y={98} w={58} u={uid} />
          <MarigoldFlower cx={34} cy={96} r={24} />
          <MarigoldFlower cx={136} cy={106} r={16} warm />
        </>
      ) : (
        <>
          <Leaf x={30} y={120} len={90} a={-120} />
          <Leaf x={20} y={170} len={80} a={-160} c="#3B8F45" />
          <Leaf x={110} y={200} len={70} a={-10} />
          <Leaf x={190} y={215} len={60} a={10} c="#3B8F45" />
          <ClayDiya x={110} y={150} w={110} u={uid} />
          <ClayDiya x={205} y={190} w={92} delay={0.4} u={uid} />
          <MarigoldFlower cx={30} cy={150} r={34} />
          <MarigoldFlower cx={62} cy={198} r={38} warm />
          <MarigoldFlower cx={140} cy={205} r={26} />
          <MarigoldFlower cx={268} cy={214} r={18} warm />
          <ClayDiya x={292} y={196} w={30} delay={0.8} u={uid} />
        </>
      )}
    </svg>
  );
}

/* ── Rangoli glow on the floor (drawn flat, squashed in CSS) ─ */
export function Rangoli({ className = "" }: P) {
  return (
    <svg viewBox="0 0 400 400" aria-hidden className={`pointer-events-none ${className}`}>
      <defs>
        <radialGradient id="rg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB347" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#FF6A3D" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FF6A3D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="200" fill="url(#rg-glow)" />
      <g fill="none" stroke="#FFC24A" strokeOpacity="0.55">
        <circle cx="200" cy="200" r="170" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
        <circle cx="200" cy="200" r="140" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="60" strokeWidth="1.5" />
      </g>
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d="M200 66 C214 92 214 112 200 136 C186 112 186 92 200 66Z" fill="#FF9A3D" fillOpacity="0.35" stroke="#FFD27A" strokeOpacity="0.6" transform={`rotate(${i * 22.5} 200 200)`} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d="M200 146 C210 160 210 172 200 186 C190 172 190 160 200 146Z" fill="#FFD27A" fillOpacity="0.4" transform={`rotate(${i * 45} 200 200)`} />
      ))}
    </svg>
  );
}

/* ── Faint temple archways (background behind the countdown) ── */
export function TempleArches({ className = "" }: P) {
  const arch = (x: number, w: number, h: number) =>
    `M${x} 400 V${400 - h * 0.62} C${x} ${400 - h * 0.85} ${x + w * 0.3} ${400 - h * 0.9} ${x + w / 2} ${400 - h} C${x + w * 0.7} ${400 - h * 0.9} ${x + w} ${400 - h * 0.85} ${x + w} ${400 - h * 0.62} V400Z`;
  return (
    <svg viewBox="0 0 600 400" aria-hidden className={`pointer-events-none ${className}`}>
      <path d={arch(40, 120, 300)} fill="#B0125F" />
      <path d={arch(190, 220, 380)} fill="#B0125F" />
      <path d={arch(440, 120, 300)} fill="#B0125F" />
      <path d={arch(225, 150, 290)} fill="#C4166A" />
    </svg>
  );
}

/* ── Lotus ornament ─────────────────────────────────────── */
export function Lotus({ className = "h-6 w-8" }: P) {
  return (
    <svg viewBox="0 0 48 32" aria-hidden className={className} fill="#FBE212">
      <path d="M24 2c5 6 6 14 0 24-6-10-5-18 0-24Z" />
      <path d="M24 26C18 18 11 13 5 12c1 8 8 14 19 14Z" />
      <path d="M24 26c6-8 13-13 19-14-1 8-8 14-19 14Z" />
      <path d="M24 26C16 24 7 22 1 23c5 5 13 6 23 3Z" opacity="0.8" />
      <path d="M24 26c8-2 17-4 23-3-5 5-13 6-23 3Z" opacity="0.8" />
      <rect x="10" y="28" width="28" height="1.6" rx="0.8" />
    </svg>
  );
}

/* ── Divider: ──◆── lotus ──◆── (used under every heading) ── */
export function Ornament({ className = "", wide = false }: P & { wide?: boolean }) {
  const line = wide ? "w-20 sm:w-28" : "w-14 sm:w-20";
  return (
    <div aria-hidden className={`divider-orn ${className}`}>
      <span className={`relative h-px ${line} bg-gradient-to-r from-transparent to-marigold`}>
        <span className="absolute -left-1 -top-[3px] h-[7px] w-[7px] rotate-45 bg-marigold/80" />
      </span>
      <Lotus className="h-5 w-7" />
      <span className={`relative h-px ${line} bg-gradient-to-l from-transparent to-marigold`}>
        <span className="absolute -right-1 -top-[3px] h-[7px] w-[7px] rotate-45 bg-marigold/80" />
      </span>
    </div>
  );
}

/* ── Jharokha arch card (stretches to its box) ─────────────
   Ogee point top + bottom, cusped shoulders, straight sides. */
const ARCH =
  "M 200 0 C 214 17.2 236 26.5 262 29.6 C 300 34.3 320 45.2 328 65.5 C 334 78 352 81.1 372 81.1 C 388 81.1 396 93.1 396 109.1 L 396 492.9 C 396 508.9 388 518.9 372 518.9 C 352 518.9 334 522 328 534.5 C 320 554.8 300 565.7 262 570.4 C 236 573.5 214 582.8 200 600 C 186 582.8 164 573.5 138 570.4 C 100 565.7 80 554.8 72 534.5 C 66 522 48 518.9 28 518.9 C 12 518.9 4 508.9 4 492.9 L 4 109.1 C 4 93.1 12 81.1 28 81.1 C 48 81.1 66 78 72 65.5 C 80 45.2 100 34.3 138 29.6 C 164 26.5 186 17.2 200 0 Z";

export function ArchFrame({ className = "" }: P) {
  return (
    <svg viewBox="0 0 400 600" preserveAspectRatio="none" aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${className}`}>
      <defs>
        <radialGradient id="arch-fill" cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#7A2A9E" />
          <stop offset="100%" stopColor="#6A1F8C" />
        </radialGradient>
      </defs>
      <path d={ARCH} fill="rgba(70,8,60,0.35)" transform="translate(0 12)" />
      <path d={ARCH} fill="url(#arch-fill)" stroke="#8A3BB0" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path d={ARCH} fill="none" stroke="#F9DD21" strokeOpacity="0.75" strokeWidth="1.6" vectorEffect="non-scaling-stroke" transform="translate(12 18) scale(0.94)" />
      <path d={ARCH} fill="none" stroke="#F9DD21" strokeOpacity="0.28" strokeWidth="1" vectorEffect="non-scaling-stroke" transform="translate(20 30) scale(0.9)" />
    </svg>
  );
}

/* ── Arch-shaped countdown tile ─────────────────────────── */
export function ArchTile({ className = "" }: P) {
  const d = "M50 2 C55 9 62 12 70 13 C78 14 82 18 84 22 C86 25 92 26 96 26 C98 26 98 28 98 30 L98 96 C98 98 98 100 96 100 C92 100 86 101 84 104 C82 108 78 112 70 113 C62 114 55 117 50 124 C45 117 38 114 30 113 C22 112 18 108 16 104 C14 101 8 100 4 100 C2 100 2 98 2 96 L2 30 C2 28 2 26 4 26 C8 26 14 25 16 22 C18 18 22 14 30 13 C38 12 45 9 50 2Z";
  return (
    <svg viewBox="0 0 100 126" preserveAspectRatio="none" aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}>
      <path d={d} fill="#5A1A7E" fillOpacity="0.95" stroke="#F9DD21" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ── Cusped coral plaque ("DRESS LIKE YOU ARE THE MAIN CHARACTER") ──
   Coral fill, orange double outline — as on the poster. */
const PLAQUE = "M22 2 H278 C284 10 290 14 298 16 C292 26 292 44 298 54 C290 56 284 60 278 68 H22 C16 60 10 56 2 54 C8 44 8 26 2 16 C10 14 16 10 22 2Z";
export function Plaque({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative px-8 py-3.5 ${className}`}>
      <svg viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_6px_12px_rgba(70,8,60,0.35)]">
        <path d={PLAQUE} fill="#E2247C" stroke="#FB8E32" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        <path d={PLAQUE} fill="none" stroke="#FB8E32" strokeWidth="1.4" vectorEffect="non-scaling-stroke" transform="translate(10 6) scale(0.933 0.83)" />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

/* ── Diya (purple, simple) — kept for the final CTA ─────── */
export function Diya({ className = "h-20 w-24", style }: P) {
  return (
    <svg viewBox="0 0 120 100" aria-hidden className={className} style={style}>
      <defs>
        <radialGradient id="diya-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE58A" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#FF8A1F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF8A1F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="diya-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF6C8" />
          <stop offset="55%" stopColor="#FFD43B" />
          <stop offset="100%" stopColor="#FF7A00" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="34" r="34" fill="url(#diya-glow)" className="animate-glow" style={{ transformOrigin: "60px 34px" }} />
      <path className="animate-flicker" d="M60 8 C 70 24, 70 38, 60 46 C 50 38, 50 24, 60 8 Z" fill="url(#diya-flame)" />
      <path d="M8 50 Q60 46 112 50 Q104 86 60 90 Q16 86 8 50Z" fill="#7E2A2E" />
      <path d="M8 50 Q60 58 112 50" stroke="#FFD43B" strokeWidth="3" fill="none" />
      <path d="M22 64 Q60 74 98 64" stroke="#FF8A1F" strokeWidth="3" fill="none" strokeDasharray="1 7" strokeLinecap="round" />
    </svg>
  );
}
