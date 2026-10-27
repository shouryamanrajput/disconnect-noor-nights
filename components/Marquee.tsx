import { site } from "@/lib/config";

// Running text strips, always moving left (CSS only: .marquee-track in
// globals.css). Each track holds the phrase list twice and slides by half its
// width, so the loop is seamless. Decorative (the same words are on the page),
// hence aria-hidden; data-pause stops it while off screen (PauseOffscreen).

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`shrink-0 ${className}`}>
      <path d="M12 0c.7 6.6 4.7 10.6 12 12-7.3 1.4-11.3 5.4-12 12-.7-6.6-4.7-10.6-12-12C7.3 10.6 11.3 6.6 12 0Z" fill="currentColor" />
    </svg>
  );
}

type Tone = "gold" | "plum" | "rani";
const tones: Record<Tone, { strip: string; text: string; star: string }> = {
  gold: { strip: "bg-marigold border-y-2 border-plum/80", text: "text-plum", star: "text-rani" },
  plum: { strip: "bg-plum border-y-2 border-marigold", text: "text-marigold", star: "text-blush" },
  rani: { strip: "bg-gradient-to-r from-rani via-magenta to-rani border-y-2 border-marigold", text: "text-cream", star: "text-marigold" },
};

function Strip({ items, tone, seconds, className = "" }: { items: string[]; tone: Tone; seconds: number; className?: string }) {
  const t = tones[tone];
  // repeat the list so one half is always wider than the widest screen
  const half = [...items, ...items, ...items];
  return (
    <div className={`overflow-hidden shadow-[0_6px_18px_rgba(20,3,36,0.3)] ${t.strip} ${className}`}>
      <div className="marquee-track flex w-max py-2 sm:py-2.5" style={{ animationDuration: `${seconds}s` }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {half.map((w, i) => (
              <span key={i} className={`flex items-center whitespace-nowrap font-display text-[1.05rem] uppercase leading-none tracking-[0.04em] sm:text-[1.35rem] ${t.text}`}>
                <span className="px-3 sm:px-5">{w}</span>
                <Star className={`h-3 w-3 sm:h-4 sm:w-4 ${t.star}`} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** One straight strip (under the hero). */
export function MarqueeStrip() {
  return (
    <div aria-hidden data-pause className="relative z-10">
      <Strip items={site.marquee.top} tone="gold" seconds={38} />
    </div>
  );
}

/** Two strips crossing in an X (between the scene and the form). */
export function MarqueeCross() {
  return (
    <div aria-hidden data-pause className="relative z-10 h-[120px] overflow-hidden bg-[linear-gradient(180deg,#6a2090_0%,#a01c78_55%,#e9227d_100%)] sm:h-[140px]">
      <Strip items={site.marquee.b} tone="plum" seconds={46} className="absolute inset-x-[-8%] top-[36%] -translate-y-1/2 -rotate-[5deg] sm:top-[40%] sm:-rotate-[2.5deg]" />
      <Strip items={site.marquee.a} tone="rani" seconds={30} className="absolute inset-x-[-8%] top-[64%] -translate-y-1/2 rotate-[4deg] sm:top-[60%] sm:rotate-[2deg]" />
    </div>
  );
}
