import type { CSSProperties } from "react";
import { DiscoBall, Diya } from "@/components/Decor";

// Decorative layer for the empty side gutters around narrow content
// (the registration card). Everything is aria-hidden, pointer-events-none,
// absolutely positioned (no effect on layout or section height) and drawn in
// SVG/CSS. Animations stop under prefers-reduced-motion (see globals.css).
//
// variant="full"  — hanging marigold strands, akash-kandil lanterns, a disco
//                   ball, a slowly turning mandala, paisleys, bokeh, sparkles.
//                   Shown in the gutters from lg (≥1024px) up.
// variant="light" — just a few twinkling sparkles + bokeh at the edges.
// On phones both collapse to a handful of tiny sparkles at the edges.

type Side = "left" | "right";

/* ── pieces ─────────────────────────────────────────────── */
function Strand({ length, delay, style, className = "" }: { length: number; delay: number; style?: CSSProperties; className?: string }) {
  const n = Math.max(3, Math.floor((length - 30) / 22));
  return (
    <svg viewBox={`0 0 24 ${length}`} width={24} height={length} className={`bd-sway absolute top-0 ${className}`} style={{ animationDelay: `${-delay}s`, ...style }}>
      <line x1="12" y1="0" x2="12" y2={length - 18} stroke="#F9DD21" strokeOpacity="0.6" strokeWidth="1" />
      {Array.from({ length: n }).map((_, i) => {
        const y = 14 + i * 22;
        const warm = i % 2 === 1;
        return (
          <g key={i}>
            <circle cx="12" cy={y} r="8" fill={warm ? "#F58A3E" : "#FBB321"} stroke={warm ? "#FB8E32" : "#FFCE3C"} strokeWidth="3" strokeDasharray="2 1.6" />
            <circle cx="12" cy={y} r="3.2" fill={warm ? "#E86A00" : "#F58A3E"} />
            {i < n - 1 && <path d={`M12 ${y + 9}c-4 2-6 4-6 6 3 0 5-2 6-5 1 3 3 5 6 5 0-2-2-4-6-6Z`} fill="#2C821B" opacity="0.85" />}
          </g>
        );
      })}
      {/* tassel */}
      <path d={`M12 ${length - 18}l-4 12h8Z`} fill="#E2247C" />
      <circle cx="12" cy={length - 19} r="2.6" fill="#F9DD21" />
    </svg>
  );
}

function Kandil({ string, delay, style }: { string: number; delay: number; style?: CSSProperties }) {
  return (
    <div className="bd-sway absolute top-0 flex flex-col items-center" style={{ animationDelay: `${-delay}s`, ...style }}>
      <div className="w-px bg-marigold/60" style={{ height: string }} />
      <div className="relative">
        <div className="bd-glow absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(255,206,60,0.45),transparent_65%)]" style={{ animationDelay: `${-delay}s` }} />
        <svg viewBox="0 0 64 128" width={58} height={116} className="relative">
          <rect x="24" y="0" width="16" height="7" rx="2" fill="#F9DD21" />
          {/* star-shaped akash kandil */}
          <path d="M32 8 52 34 62 46 52 58 32 84 12 58 2 46 12 34Z" fill="#E2247C" stroke="#F9DD21" strokeWidth="2" />
          <path d="M32 8 44 46 32 84 20 46Z" fill="#FB8E32" opacity="0.9" />
          <path d="M2 46h60" stroke="#F9DD21" strokeWidth="1.5" />
          <path d="M12 34h40M12 58h40" stroke="#F9DD21" strokeOpacity="0.7" strokeWidth="1" />
          <circle cx="32" cy="46" r="6" fill="#FFF1C9" opacity="0.9" />
          {/* paper tails */}
          {[20, 26, 32, 38, 44].map((x, i) => (
            <path key={x} d={`M${x} 82 q${i % 2 ? 2 : -2} 18 0 ${34 - Math.abs(i - 2) * 6}`} stroke={i % 2 ? "#F9DD21" : "#FF7FB8"} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ))}
        </svg>
      </div>
    </div>
  );
}

// Pre-rendered to public/decor/mandala.svg (24 + 16 petals, dot rings) so it
// stays out of the page HTML; it only spins slowly behind the cards.
function Mandala({ className = "", style }: { className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/decor/mandala.svg" alt="" aria-hidden width={200} height={200} loading="lazy" decoding="async" className={`bd-spin absolute h-auto ${className}`} style={style} />;
}

function Paisley({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 60 80" className={`absolute ${className}`} style={style}>
      <g fill="none" stroke="#F9DD21" strokeWidth="1.4" strokeLinecap="round">
        <path d="M28 76C13 76 4 64 4 50 4 28 22 8 46 4c-8 8-10 17-6 25 4 9 14 13 14 25 0 12-11 22-26 22Z" />
        <path d="M28 68c-10 0-17-8-17-18 0-15 12-30 28-34-5 7-6 14-3 20 3 7 10 10 10 18 0 8-8 14-18 14Z" strokeOpacity="0.7" />
        <circle cx="29" cy="50" r="6" />
        <circle cx="29" cy="50" r="2" fill="#F9DD21" />
      </g>
    </svg>
  );
}

function Sparkle({ style, className = "" }: { style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`bd-twinkle absolute ${className}`} style={style}>
      <path d="M12 0c.7 6.6 4.7 10.6 12 12-7.3 1.4-11.3 5.4-12 12-.7-6.6-4.7-10.6-12-12C7.3 10.6 11.3 6.6 12 0Z" fill="#FBE212" />
    </svg>
  );
}

function Bokeh({ style }: { style: CSSProperties }) {
  return <span className="bd-float absolute rounded-full bg-[radial-gradient(circle,rgba(255,206,60,0.55),rgba(255,206,60,0)_70%)]" style={style} />;
}

/* sparkle positions: [left%, top%, size px, delay s] inside a gutter */
const SPARKS: [number, number, number, number][] = [
  [18, 14, 14, 0], [70, 22, 10, 1.1], [40, 34, 12, 2.3], [84, 47, 9, 0.6], [12, 60, 11, 1.7], [58, 70, 14, 2.9], [30, 86, 10, 0.9], [78, 92, 12, 2.1],
];
const BOKEH: [number, number, number, number][] = [
  [22, 26, 90, 0], [72, 52, 120, 3], [30, 76, 100, 5], [80, 12, 70, 2],
];

function Gutter({ side, variant }: { side: Side; variant: "full" | "light" }) {
  const d = side === "left" ? 0 : 1.7; // de-sync the two sides
  return (
    <div className={side === "right" ? "absolute inset-0 -scale-x-100" : "absolute inset-0"}>
      {BOKEH.map(([x, y, s, del], i) => (
        <Bokeh key={`b${i}`} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, marginLeft: -s / 2, animationDelay: `${-(del + d * 2)}s`, opacity: variant === "full" ? 0.55 : 0.4 }} />
      ))}
      {SPARKS.map(([x, y, s, del], i) => (
        <Sparkle key={`s${i}`} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${-(del + d)}s`, opacity: 0.75 }} />
      ))}
      {variant === "full" && (
        <>
          <Strand length={230} delay={0.4 + d} style={{ left: "10%" }} />
          <Strand length={150} delay={1.6 + d} style={{ left: "52%" }} />
          <Strand length={110} delay={2.8 + d} style={{ left: "86%" }} />
          <Kandil string={70} delay={1 + d} style={{ left: "26%" }} />
          <DiscoBall size={34} string={360} period={5} seed={side === "left" ? 6 : 7} specks={false} delay={2 + d} className="absolute left-[66%] top-0" />
          <Mandala className="left-1/2 top-[50%] w-[min(360px,92%)] opacity-[0.22]" />
          <Paisley className="left-[14%] top-[78%] w-12 opacity-30" />
          <Paisley className="left-[70%] top-[74%] w-9 -rotate-12 opacity-25" />
          <Diya className="absolute bottom-6 left-[18%] h-10 w-12 opacity-90" />
          <Diya className="absolute bottom-6 left-[52%] h-12 w-14" />
        </>
      )}
    </div>
  );
}

/**
 * @param inner half-width (px) of the centred content to keep clear on desktop.
 */
export default function FestiveBackdrop({ variant = "full", inner = 240 }: { variant?: "full" | "light"; inner?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* desktop gutters */}
      <div className="absolute inset-y-0 left-0 hidden lg:block" style={{ right: `calc(50% + ${inner}px)` }}>
        <Gutter side="left" variant={variant} />
      </div>
      <div className="absolute inset-y-0 right-0 hidden lg:block" style={{ left: `calc(50% + ${inner}px)` }}>
        <Gutter side="right" variant={variant} />
      </div>
      {/* phones / tablets: a few tiny sparkles at the very edges */}
      <div className="absolute inset-0 lg:hidden">
        {[
          [2.5, 10, 10, 0], [93, 18, 9, 1.2], [4, 46, 8, 2.1], [92, 58, 10, 0.7], [3, 82, 9, 1.6], [94, 90, 8, 2.6],
        ].map(([x, y, s, del], i) => (
          <Sparkle key={i} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${-del}s`, opacity: 0.7 }} />
        ))}
      </div>
    </div>
  );
}
