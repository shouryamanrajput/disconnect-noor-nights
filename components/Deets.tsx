import { site } from "@/lib/config";
import { Ornament } from "@/components/Decor";
import FestiveBackdrop from "@/components/FestiveBackdrop";

const icons = [
  "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
  "M4 6h16v12H4zM4 7l8 6 8-6",
];

// One compact section: the deets (2×2 on phones, one slim bar on desktop),
// and the dress code as a slim coral strip.
export default function Deets() {
  return (
    <section id="deets" className="bg-royal-tex relative scroll-mt-12 overflow-hidden sm:scroll-mt-14 py-6 sm:py-9">
      <FestiveBackdrop variant="light" inner={550} />
      <div className="container-px relative z-10 max-w-content lg:max-w-[1080px]">
        <div>
          <div className="text-center">
            <h2 className="gold-text font-display text-[1.75rem] uppercase leading-tight sm:text-[2.4rem]">The deets</h2>
            <Ornament className="mt-1" />
          </div>
        </div>

        <div>
          <dl className="mt-3 grid grid-cols-2 overflow-hidden rounded-2xl border-2 border-marigold/60 bg-plum/50 shadow-[0_6px_14px_rgba(20,3,36,0.25)] sm:mt-4 lg:grid-cols-4">
            {site.deets.map((d, i) => (
              <div
                key={d.label}
                className={`flex items-start gap-2 px-3 py-2.5 sm:items-center sm:gap-2.5 sm:px-4 sm:py-3 ${i % 2 === 1 ? "border-l border-marigold/25" : ""} ${i >= 2 ? "border-t border-marigold/25 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-marigold text-plum sm:mt-0 sm:h-8 sm:w-8 sm:rounded-lg">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]" aria-hidden>
                    <path d={icons[i]} />
                  </svg>
                </span>
                <div className="min-w-0">
                  <dt className="text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-marigold/90">{d.label}</dt>
                  <dd className="mt-1 font-sans text-[13px] font-extrabold leading-tight text-cream sm:text-[14.5px]">{d.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <div id="dress-code" className="mt-4 scroll-mt-24 rounded-xl border-2 border-marigold/60 bg-gradient-to-br from-coral to-rani px-3.5 py-2.5 text-center shadow-[0_6px_14px_rgba(20,3,36,0.25)] sm:mt-5 sm:flex sm:items-center sm:gap-5 sm:px-6 sm:py-3 sm:text-left">
            <p className="sm:shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/90">Dress code<span className="sm:hidden"> · </span></span>
              <span className="gold-text font-display text-[1.3rem] uppercase leading-tight sm:mt-0.5 sm:block sm:text-[1.7rem]">{site.dressCode.title}</span>
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-cream sm:mt-0 sm:text-[14px]">{site.dressCode.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
