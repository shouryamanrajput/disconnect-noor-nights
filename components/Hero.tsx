import { site } from "@/lib/config";
import { ArchFrame, DiscoBall, DiyaCluster, Lotus, Ornament, Plaque, Rangoli, TempleArches, Toran } from "@/components/Decor";
import { CalendarIcon, ClockIcon, PinIcon } from "@/components/Icons";
import Countdown from "@/components/Countdown";
import AnimatedElephant from "@/components/AnimatedElephant";
import InviteButton from "@/components/InviteButton";

// Banner-style hero (matches the design reference):
// desktop — toran + fairy lights + 3 disco balls along the top, ornate arch
// card left-centre, countdown right, elephants at the far edges facing in,
// diya + marigold clusters in the bottom corners, rangoli glow on the floor.
// phones — arch then countdown, elephants peeking at the arch's top corners,
// one small diya + marigold cluster each side of the arch base.
export default function Hero() {
  const e = site.event;
  return (
    <section id="top" className="bg-hero relative overflow-hidden pt-14 sm:pt-16 lg:flex lg:min-h-[100svh] lg:flex-col">
      <div aria-hidden className="hero-bokeh pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-14 bg-gradient-to-b from-transparent to-[#8e1050]" />
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
        <DiscoBall size={24} string={10} period={4.8} seed={4} specks={false} className="absolute left-[29%] top-0 flex sm:left-[33%] sm:top-1 lg:hidden" delay={0.6} />
        <DiscoBall size={24} string={18} period={5.4} seed={5} specks={false} className="absolute right-[29%] top-0 flex sm:right-[33%] sm:top-1 lg:hidden" delay={2.4} />
      </div>

      {/* desktop: elephants at the far edges + diya clusters in the corners */}
      <AnimatedElephant side="left" sizes="280px" priority className="absolute left-0 top-[41%] z-10 hidden w-[clamp(170px,19vw,300px)] lg:block" />
      <AnimatedElephant side="right" sizes="280px" priority phase={260} className="absolute right-0 top-[41%] z-10 hidden w-[clamp(170px,19vw,300px)] lg:block" />
      <DiyaCluster uid="dcl" side="left" className="absolute -bottom-2 left-0 z-10 hidden w-[clamp(180px,17vw,290px)] lg:block" />
      <DiyaCluster uid="dcr" side="right" className="absolute -bottom-2 right-0 z-10 hidden w-[clamp(180px,17vw,290px)] lg:block" />

      <div className="relative z-20 mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center px-5 pb-14 pt-[68px] sm:px-10 sm:pb-20 sm:pt-28 lg:flex-row lg:justify-center lg:gap-[clamp(48px,8vw,130px)] lg:pb-16 lg:pt-[92px]">
        {/* ── Arch card ── */}
        <div className="relative w-full max-w-[400px] sm:max-w-[460px] lg:w-[clamp(390px,31vw,450px)] lg:max-w-none">
          {/* phones / tablets: elephants peek from the arch's top corners */}
          <AnimatedElephant side="left" sizes="150px" className="absolute -left-5 -top-8 z-0 w-[96px] min-[400px]:w-[104px] sm:-left-24 sm:-top-6 sm:w-[150px] lg:hidden" />
          <AnimatedElephant side="right" sizes="150px" phase={260} className="absolute -right-5 -top-8 z-0 w-[96px] min-[400px]:w-[104px] sm:-right-24 sm:-top-6 sm:w-[150px] lg:hidden" />
          <Rangoli className="absolute -bottom-[290px] left-1/2 hidden h-[640px] w-[640px] -translate-x-1/2 scale-y-[0.24] lg:block" />

          <div className="relative px-11 pb-[4.4rem] pt-[4.6rem] text-center min-[400px]:px-12 sm:px-16 sm:pb-[5.2rem] sm:pt-[5.6rem] lg:px-14 lg:pb-[3.9rem] lg:pt-[4.4rem]">
            <ArchFrame />
            <Lotus className="absolute left-1/2 top-[3.4%] h-6 w-9 -translate-x-1/2 sm:h-7 sm:w-10" />
            <div className="relative">
              <p className="font-caps text-[11px] font-bold uppercase tracking-[0.2em] text-cream sm:text-[13px] sm:tracking-[0.24em]">{site.name} presents</p>
              <h1 className="mt-1 sm:mt-2">
                <span className="gold-text block font-hindi text-[3.5rem] leading-[1.15] min-[400px]:text-[3.8rem] sm:text-[5.4rem] lg:text-[4.5rem] xl:text-[4.8rem]">{e.hindiTitle}</span>
                <span className="gold-text -mt-1 block whitespace-nowrap font-caps text-[1.6rem] font-bold uppercase leading-none min-[400px]:text-[1.75rem] sm:text-[2.4rem] lg:text-[2.15rem] xl:text-[2.3rem]">{e.latinTitle}</span>
                <span className="sr-only"> — {e.title}</span>
              </h1>
              <Ornament className="mt-4 sm:mt-5 lg:mt-3" />
              <ul className="mx-auto mt-3 inline-flex flex-col items-start gap-1.5 text-left sm:mt-4 sm:gap-2">
                <li className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 shrink-0 text-marigold sm:h-6 sm:w-6" />
                  <span className="font-caps text-[1.2rem] font-bold uppercase tracking-wide text-marigold sm:text-[1.6rem]">{e.posterDate}</span>
                </li>
                <li className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 shrink-0 text-marigold sm:h-6 sm:w-6" />
                  <span className="font-caps text-[15px] font-semibold uppercase tracking-[0.1em] text-cream sm:text-lg">{e.posterTime}</span>
                </li>
                <li className="flex items-center gap-3">
                  <PinIcon className="h-5 w-5 shrink-0 text-marigold sm:h-6 sm:w-6" />
                  <span className="font-caps text-[1.1rem] font-bold uppercase tracking-[0.12em] text-marigold sm:text-[1.35rem]">{e.posterPlace}</span>
                </li>
              </ul>
              <Plaque className="mx-auto mt-4 max-w-[calc(100%-2rem)] sm:mt-5 sm:max-w-[330px] lg:mt-4">
                <p className="font-caps text-[12px] font-bold uppercase leading-snug tracking-wide text-cream sm:text-[13px]">{e.posterNote}</p>
              </Plaque>
              <div className="mt-5 flex justify-center sm:mt-6 lg:mt-5">
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
        <div className="mt-12 w-full max-w-[400px] sm:mt-16 lg:mt-0 lg:w-[clamp(330px,28vw,410px)] lg:max-w-none">
          <Countdown />
        </div>
      </div>
    </section>
  );
}
