import { site } from "@/lib/config";
import Reveal from "@/components/Reveal";
import SceneIcon from "@/components/SceneIcon";
import SectionHeading from "@/components/SectionHeading";

// "What's the scene?" — compact wrapping row of festive chips.
export default function Scene() {
  return (
    <section id="scene" className="bg-poster relative scroll-mt-16 overflow-hidden py-16 sm:py-24">
      <div className="container-px relative max-w-content">
        <Reveal>
          <SectionHeading title="What’s the scene?" />
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="mt-10 grid grid-cols-1 gap-2.5 min-[370px]:grid-cols-2 sm:mt-12 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
            {site.scene.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-2 min-h-[52px] rounded-2xl border-2 border-marigold/60 bg-royal/95 px-3 py-2 shadow-[0_6px_16px_rgba(36,6,63,0.3)] sm:gap-2.5 sm:rounded-full sm:px-5 sm:py-2.5"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-night/50 sm:h-8 sm:w-8">
                  <SceneIcon name={s.icon} className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                </span>
                <span className="text-[15px] font-semibold leading-tight text-cream sm:text-base">{s.label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
