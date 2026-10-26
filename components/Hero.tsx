import { site } from "@/lib/config";
import { ArchFrame, DiscoBall, DiyaCluster, Lotus, Ornament, Plaque, Rangoli, TempleArches, Toran } from "@/components/Decor";
import Countdown from "@/components/Countdown";
import AnimatedElephant from "@/components/AnimatedElephant";
import InviteButton from "@/components/InviteButton";

// Banner-style hero (matches the design reference):
// desktop — toran + fairy lights + 3 disco balls along the top, ornate arch
// card left-centre, countdown right, elephants at the far edges facing in,
// diya + marigold clusters in the bottom corners, rangoli glow on the floor.
// phones — arch then countdown, elephants peeking at the arch's top corners,
// one small diya + marigold cluster each side of the arch base.
// "Oct 31st, 2026" → 31<sup>st</sup>, like the poster.
function Ordinal({ text }: { text: string }) {
  const m = text.match(/^(.*?\d)(st|nd|rd|th)(.*)$/i);
  if (!m) return <>{text}</>;
  return (
    <>
      {m[1]}
      <sup className="ml-[1px] align-[0.65em] text-[0.5em]">{m[2]}</sup>
      {m[3]}
    </>
  );
}

// Four-point sparkle flanking the place, as on the poster.
function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 0c.7 6.6 4.7 10.6 12 12-7.3 1.4-11.3 5.4-12 12-.7-6.6-4.7-10.6-12-12C7.3 10.6 11.3 6.6 12 0Z" fill="#F9DD21" />
    </svg>
  );
}

export default function Hero() {
  const e = site.event;
  return (
    <section id="top" className="bg-hero relative overflow-hidden pt-12 sm:pt-16 lg:flex lg:min-h-[100svh] lg:flex-col">
      <div aria-hidden className="hero-bokeh pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-14 bg-gradient-to-b from-transparent to-magenta" />
      <div aria-hidden className="hero-floor pointer-events-none absolute inset-x-0 bottom-0 hidden h-[17%] lg:block" />
      <TempleArches className="absolute bottom-[14%] right-[13%] hidden w-[34vw] max-w-[560px] opacity-20 [mask-image:linear-gradient(to_bottom,black_30%,transparent)] lg:block" />

      {/* garland, fairy lights, disco balls */}
      <div className="absolute inset-x-0 top-14 z-10 sm:top-16">
        <Toran full className="hidden lg:block" />
        <Toran className="lg:hidden" />
        <DiscoBall size={52} string={64} period={5.2} seed={1} className="absolute left-[4.5%] top-0 hidden lg:flex" delay={0.2} />
        <DiscoBall size={46} string={44} period={4.4} seed={2} className="absolute left-[50.5%] top-0 hidden lg:flex" delay={1.9} />
        <DiscoBall size={52} string={64} period={5.8} seed={3} className="absolute right-[4.5%] top-0 hidden lg:flex" delay={3.1} />
        {/* phones / tablets: two small balls between the elephants and the arch tip */}
        <DiscoBall size={24} string={10} period={4.8} seed={4} specks={false} lite className="absolute left-[29%] top-0 flex sm:left-[33%] sm:top-1 lg:hidden" delay={0.6} />
        <DiscoBall size={24} string={18} period={5.4} seed={5} specks={false} lite className="absolute right-[29%] top-0 flex sm:right-[33%] sm:top-1 lg:hidden" delay={2.4} />
      </div>

      {/* desktop: elephants at the far edges + diya clusters in the corners */}
      <AnimatedElephant side="left" sizes="280px" className="absolute left-0 top-[41%] z-10 hidden w-[clamp(170px,19vw,300px)] lg:block" />
      <AnimatedElephant side="right" sizes="280px" phase={260} className="absolute right-0 top-[41%] z-10 hidden w-[clamp(170px,19vw,300px)] lg:block" />
      <DiyaCluster uid="dcl" side="left" className="absolute -bottom-2 left-0 z-10 hidden w-[clamp(180px,17vw,290px)] lg:block" />
      <DiyaCluster uid="dcr" side="right" className="absolute -bottom-2 right-0 z-10 hidden w-[clamp(180px,17vw,290px)] lg:block" />

      <div className="relative z-20 mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center px-5 pb-6 pt-[56px] sm:px-10 sm:pb-12 sm:pt-24 lg:flex-row lg:justify-center lg:gap-[clamp(48px,8vw,130px)] lg:pb-10 lg:pt-[78px]">
        {/* ── Arch card ── */}
        <div className="relative w-full max-w-[400px] sm:max-w-[460px] lg:w-[clamp(390px,31vw,450px)] lg:max-w-none">
          {/* phones / tablets: elephants peek from the arch's top corners */}
          <AnimatedElephant side="left" sizes="(min-width: 640px) 150px, 104px" priority className="absolute -left-5 -top-8 z-0 w-[96px] min-[400px]:w-[104px] sm:-left-24 sm:-top-6 sm:w-[150px] lg:hidden" />
          <AnimatedElephant side="right" sizes="(min-width: 640px) 150px, 104px" priority phase={260} className="absolute -right-5 -top-8 z-0 w-[96px] min-[400px]:w-[104px] sm:-right-24 sm:-top-6 sm:w-[150px] lg:hidden" />
          <Rangoli className="absolute -bottom-[290px] left-1/2 hidden h-[640px] w-[640px] -translate-x-1/2 scale-y-[0.24] lg:block" />
          <Rangoli className="absolute -bottom-[196px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 scale-y-[0.22] lg:hidden" />

          <div className="relative px-11 pb-[3.5rem] pt-[4rem] text-center min-[400px]:px-12 sm:px-16 sm:pb-[4.6rem] sm:pt-[5rem] lg:px-14 lg:pb-[3.4rem] lg:pt-[4rem]">
            <ArchFrame />
            <Lotus className="absolute left-1/2 top-[3.4%] h-6 w-9 -translate-x-1/2 sm:h-7 sm:w-10" />
            <div className="relative">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-cream sm:text-[12px] sm:tracking-[0.3em]">{site.name} presents</p>
              <h1 className="mt-1 sm:mt-2">
                <span className="gold-text title-lg block font-hindi text-[3.6rem] font-bold leading-[1.2] min-[400px]:text-[3.9rem] sm:text-[5.4rem] lg:text-[4.6rem] xl:text-[4.9rem]">{e.hindiTitle}</span>
                <span className="gold-text title-lg -mt-1 block whitespace-nowrap font-display text-[2.6rem] leading-none [-webkit-text-stroke:0.6px_#FBE212] [font-variant:small-caps] min-[400px]:text-[2.85rem] sm:text-[3.9rem] lg:text-[3.45rem] xl:text-[3.65rem]">{e.latinTitle}</span>
                <span className="sr-only"> — {e.title}</span>
              </h1>
              <Ornament className="mt-3 sm:mt-4 lg:mt-3" />
              <div className="mt-2.5 sm:mt-3">
                <p className="font-sans text-[1.45rem] font-extrabold uppercase leading-none text-gold drop-shadow-[0_2px_0_rgba(70,8,90,0.5)] sm:text-[1.95rem] lg:text-[1.75rem]">
                  <Ordinal text={e.posterDate} />
                </p>
                <p className="mt-1.5 font-caps text-[15px] uppercase tracking-[0.06em] text-gold sm:text-[1.2rem] lg:text-[1.1rem]">{e.posterTime}</p>
                <p className="mt-2 flex items-center justify-center gap-3 whitespace-nowrap font-sans text-[1.3rem] font-extrabold uppercase leading-none text-gold drop-shadow-[0_2px_0_rgba(70,8,90,0.5)] sm:text-[1.7rem] lg:gap-2 lg:text-[1.3rem] xl:text-[1.45rem]">
                  <Sparkle className="h-5 w-5 shrink-0 sm:h-7 sm:w-7" />
                  {e.posterPlace}
                  <Sparkle className="h-5 w-5 shrink-0 sm:h-7 sm:w-7" />
                </p>
              </div>
              <Ornament className="mt-2.5 sm:mt-3" />
              <Plaque className="mx-auto mt-3 max-w-[calc(100%-1rem)] sm:mt-4 sm:max-w-[340px] lg:mt-3">
                <p className="font-caps text-[12.5px] font-bold uppercase leading-snug tracking-[0.04em] text-amber sm:text-[14px]">{e.dressLine}</p>
              </Plaque>
              <p className="mt-3 font-sans text-[13px] font-extrabold uppercase tracking-[0.08em] text-gold sm:text-[15px]">{e.posterNote}</p>
              <div className="mt-3 flex justify-center sm:mt-4 lg:mt-3">
                <InviteButton className="min-h-[48px] w-full max-w-[230px] sm:w-auto sm:max-w-none sm:px-8" />
              </div>
            </div>
            <Lotus className="absolute bottom-[2.6%] left-1/2 h-5 w-8 -translate-x-1/2 sm:h-6 sm:w-9" />
          </div>
          {/* phones / tablets: small diya + marigold clusters at the arch base */}
          <DiyaCluster uid="dml" compact side="left" className="absolute -bottom-3 -left-3 w-[84px] sm:-left-14 sm:w-[120px] lg:hidden" />
          <DiyaCluster uid="dmr" compact side="right" className="absolute -bottom-3 -right-3 w-[84px] sm:-right-14 sm:w-[120px] lg:hidden" />
        </div>

        {/* ── Countdown ── */}
        <div className="mt-6 w-full max-w-[320px] sm:mt-10 sm:max-w-[360px] lg:mt-0 lg:w-[clamp(330px,28vw,410px)] lg:max-w-none">
          <Countdown />
        </div>
      </div>
    </section>
  );
}
