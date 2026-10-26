import { site } from "@/lib/config";
import Reveal from "@/components/Reveal";
import SceneIcon from "@/components/SceneIcon";
import { Ornament } from "@/components/Decor";

const icons = [
  "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
  "M4 6h16v12H4zM4 7l8 6 8-6",
];

// One compact section: the deets (4 tiles, 2×2 on phones, one row on desktop),
// the scene as small chips, and the dress code as a single coral strip.
export default function Deets() {
  return (
    <section id="deets" className="bg-royal-tex relative scroll-mt-14 overflow-hidden py-8 sm:py-14">
      <div className="container-px relative max-w-content lg:max-w-[1080px]">
        <Reveal>
          <div className="text-center">
            <h2 className="gold-text title-lg font-display text-[2.1rem] uppercase leading-tight sm:text-5xl">The deets</h2>
            <Ornament className="mt-2" />
          </div>
        </Reveal>

        {/* phones: one card with four rows */}
        <Reveal>
          <dl className="mt-5 divide-y divide-marigold/25 rounded-2xl border-2 border-marigold/60 bg-plum/50 px-3.5 py-1 shadow-[0_10px_24px_rgba(20,3,36,0.3)] sm:hidden">
            {site.deets.map((d, i) => (
              <div key={d.label} className="flex items-center gap-2.5 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-marigold text-plum">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                    <path d={icons[i]} />
                  </svg>
                </span>
                <dt className="w-[74px] shrink-0 text-[11px] font-bold uppercase leading-tight tracking-[0.12em] text-marigold/90">{d.label}</dt>
                <dd className="min-w-0 font-sans text-[14px] font-extrabold leading-snug text-cream">{d.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* tablet / desktop: tiles, one row on desktop */}
        <div className="mt-8 hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {site.deets.map((d, i) => (
            <Reveal key={d.label} delay={i * 0.05}>
              <div className="flex h-full items-center gap-3 rounded-2xl border-2 border-marigold/60 bg-plum/50 p-4 shadow-[0_10px_24px_rgba(20,3,36,0.3)]">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-marigold text-plum">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
                    <path d={icons[i]} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-marigold/90">{d.label}</p>
                  <p className="mt-0.5 font-sans text-[16px] font-extrabold leading-snug text-cream">{d.value}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div id="scene" className="scroll-mt-24">
            <p className="mt-5 text-center font-sans text-[12px] font-extrabold uppercase tracking-[0.22em] text-gold sm:mt-9 sm:text-[13px]">What’s the scene?</p>
            <ul className="mt-2.5 flex flex-wrap justify-center gap-1 sm:gap-2">
              {site.scene.map((s) => (
                <li key={s.label} className="flex min-h-[32px] items-center gap-1.5 rounded-full border border-marigold/55 bg-plum/45 py-1 pl-1 pr-2.5 sm:min-h-[40px] sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-4">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-night/50 sm:h-7 sm:w-7">
                    <SceneIcon name={s.icon} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                  <span className="whitespace-nowrap text-[12.5px] font-semibold leading-tight text-cream sm:text-[14.5px]">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div id="dress-code" className="mt-5 scroll-mt-24 rounded-2xl border-2 border-marigold/60 bg-gradient-to-br from-coral to-rani px-4 py-3.5 text-center shadow-[0_10px_24px_rgba(20,3,36,0.3)] sm:mt-8 sm:flex sm:items-center sm:gap-6 sm:px-7 sm:text-left">
            <div className="sm:shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cream/90">Dress code</p>
              <h3 className="gold-text font-display text-[1.75rem] uppercase leading-tight sm:text-[2.2rem]">{site.dressCode.title}</h3>
            </div>
            <p className="mt-1 text-[13.5px] leading-snug text-cream sm:mt-0 sm:text-[15.5px]">{site.dressCode.body}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
