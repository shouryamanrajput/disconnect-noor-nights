import { site } from "@/lib/config";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

const icons = [
  "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
  "M4 6h16v12H4zM4 7l8 6 8-6",
];
const outfits = ["Kurtas", "Suits", "Sarees", "Lehengas", "Shararas"];

// Date / time / location / venue tiles, with the dress code as a compact card.
export default function Deets() {
  return (
    <section id="deets" className="bg-royal-tex relative scroll-mt-14 overflow-hidden py-16 sm:py-24">
      <div className="container-px relative max-w-content">
        <Reveal>
          <SectionHeading title="The deets" />
        </Reveal>

        <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4">
          {site.deets.map((d, i) => (
            <Reveal key={d.label} delay={i * 0.06}>
              <div className="flex h-full items-center gap-4 rounded-2xl border-2 border-marigold/60 bg-royal/80 p-4 shadow-[0_12px_30px_rgba(20,3,36,0.35)] sm:p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-marigold text-plum">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
                    <path d={icons[i]} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-marigold/90">{d.label}</p>
                  <p className="mt-0.5 font-display text-xl leading-snug text-cream sm:text-2xl">{d.value}</p>
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.25} className="sm:col-span-2">
            <div id="dress-code" className="scroll-mt-24 rounded-2xl border-2 border-marigold/60 bg-gradient-to-br from-[#a4135a] to-rani p-5 text-center shadow-[0_12px_30px_rgba(20,3,36,0.35)] sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cream/90">Dress code</p>
              <h3 className="gold-text mt-1 font-display text-3xl uppercase sm:text-4xl">{site.dressCode.title}</h3>
              <p className="mx-auto mt-3 max-w-[620px] text-base leading-relaxed text-cream">{site.dressCode.body}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {outfits.map((t) => (
                  <span key={t} className="rounded-full border border-marigold/70 bg-night/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-marigold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
