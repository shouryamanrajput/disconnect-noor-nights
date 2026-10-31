import { site } from "@/lib/config";
import AnimatedElephant from "@/components/AnimatedElephant";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import InstagramIcon from "@/components/InstagramIcon";
import { Diya, Ornament } from "@/components/Decor";
import FestiveBackdrop from "@/components/FestiveBackdrop";

// Shown in place of RegisterForm while site.registrationsOpen is false.
// Same arch panel as the form (id="register", so every CTA still lands here).
export default function RegistrationClosed() {
  const c = site.closed;
  const link = "inline-flex whitespace-nowrap min-h-[44px] items-center gap-2 px-2 text-[14px] font-semibold text-marigold underline decoration-marigold/40 underline-offset-4 hover:decoration-marigold sm:text-[15px]";
  return (
    <section id="register" aria-labelledby="closed-title" className="bg-poster relative scroll-mt-12 overflow-hidden pb-10 pt-6 sm:scroll-mt-14 sm:pb-24 sm:pt-20">
      <FestiveBackdrop variant="full" inner={350} />
      <div className="container-px relative z-10 max-w-[760px]">
        <div aria-hidden className="relative z-10 -mb-5 flex items-end justify-center gap-1 sm:-mb-8 sm:gap-3">
          <AnimatedElephant side="left" sizes="120px" className="w-[64px] sm:w-[112px]" />
          <Diya uid="dyc" className="mb-1 h-9 w-10 sm:h-14 sm:w-16" />
          <AnimatedElephant side="right" sizes="120px" phase={260} className="w-[64px] sm:w-[112px]" />
        </div>
        <div className="register-arch bg-royal-tex relative px-5 pb-7 pt-12 text-center shadow-[0_12px_28px_rgba(70,8,60,0.3)] sm:px-12 sm:pb-12 sm:pt-20">
          <div aria-hidden className="register-arch-inner pointer-events-none absolute inset-2.5 border-2 border-marigold/70 sm:inset-4" />
          <div className="relative">
            <h2 id="closed-title" className="gold-text title-lg font-display text-[1.65rem] uppercase leading-tight max-[359px]:text-[1.45rem] sm:text-[3rem]">{c.heading}</h2>
            <Ornament className="mt-1.5 max-sm:gap-2 max-sm:[&>span]:w-10 max-sm:[&_svg]:h-4 max-sm:[&_svg]:w-6 sm:mt-3" />
            <p className="mx-auto mt-3 max-w-[420px] text-balance text-[14.5px] leading-relaxed text-cream sm:mt-5 sm:text-[17px]">{c.line}</p>
            <p className="coral-pill mx-auto mt-5 inline-block max-w-full rounded-full px-4 py-2 font-sans text-[12.5px] font-bold leading-snug sm:mt-7 sm:px-6 sm:text-[14px]">{c.note}</p>
            <div className="mt-4 flex flex-nowrap items-center justify-center gap-x-1 sm:mt-6 sm:flex-wrap sm:gap-x-6">
              <a href={site.links.whatsapp} target="_blank" rel="noopener noreferrer" className={link}>
                <WhatsAppIcon className="h-5 w-5" /> <span className="sm:hidden">WhatsApp</span><span className="hidden sm:inline">{site.ctas.whatsapp}</span>
              </a>
              <span aria-hidden className="h-4 w-px bg-marigold/40 sm:hidden" />
              <a href={site.links.instagramDM} target="_blank" rel="noopener noreferrer" className={link}>
                <InstagramIcon className="h-5 w-5" /> <span className="sm:hidden">Instagram DM</span><span className="hidden sm:inline">{site.ctas.instagram}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
