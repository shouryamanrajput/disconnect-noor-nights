"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/config";
import { ArchTile, Lotus, Ornament } from "@/components/Decor";

const target = new Date(site.event.startsAt).getTime();

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [
    { v: Math.floor(s / 86400), l: "Days" },
    { v: Math.floor((s % 86400) / 3600), l: "Hours" },
    { v: Math.floor((s % 3600) / 60), l: "Mins" },
    { v: s % 60, l: "Secs" },
  ];
}

// Live countdown to the party (31 Oct 2026, 5:30 PM IST by default).
export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = now === null ? null : target - now;
  const started = left !== null && left <= 0;

  return (
    <div className="w-full text-center" aria-live="polite">
      <Lotus className="mx-auto hidden h-6 w-9 lg:block" />
      <div className="flex items-center justify-center gap-3 lg:mt-2">
        <span className="h-px w-8 bg-marigold/80 sm:w-12" />
        <p className="font-sans text-[12px] font-extrabold uppercase tracking-[0.2em] text-cream sm:text-base">{started ? "The party is on" : "Party starts in"}</p>
        <span className="h-px w-8 bg-marigold/80 sm:w-12" />
      </div>
      {started ? (
        <p className="mt-4 font-display text-3xl uppercase text-marigold">See you on the dance floor!</p>
      ) : (
        <div className="mx-auto mt-3 grid max-w-[400px] grid-cols-4 gap-2 sm:gap-3">
          {(left === null ? parts(0).map((p) => ({ ...p, v: -1 })) : parts(left)).map((p) => (
            <div key={p.l} className="relative aspect-[100/124] drop-shadow-[0_6px_14px_rgba(20,2,40,0.45)]">
              <ArchTile />
              <div className="relative flex h-full flex-col items-center justify-center pt-1">
                <div className="font-sans text-[1.65rem] font-extrabold leading-none tabular-nums text-marigold sm:text-[2.1rem]" suppressHydrationWarning>
                  {p.v < 0 ? "--" : String(p.v).padStart(2, "0")}
                </div>
                <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-cream/90">{p.l}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Ornament className="mt-4 hidden lg:flex" />
    </div>
  );
}
