import { site } from "@/lib/config";
import InviteButton from "@/components/InviteButton";
import Reveal from "@/components/Reveal";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import InstagramIcon from "@/components/InstagramIcon";
import AnimatedElephant from "@/components/AnimatedElephant";
import { Diya } from "@/components/Decor";

// The one final call to action: request an invite, with WhatsApp / IG as backups.
export default function InviteCTA() {
  return (
    <section id="request" className="bg-poster relative scroll-mt-14 overflow-hidden py-16 sm:py-24">
      <Reveal className="container-px relative max-w-content text-center">
        {/* elephant pair facing a diya */}
        <div aria-hidden className="flex items-end justify-center gap-1 sm:gap-3">
          <AnimatedElephant side="left" sizes="120px" className="w-[84px] sm:w-[120px]" />
          <Diya className="mb-1 h-12 w-14 sm:h-14 sm:w-16" />
          <AnimatedElephant side="right" sizes="120px" phase={260} className="w-[84px] sm:w-[120px]" />
        </div>
        <h2 className="gold-text mt-6 font-display text-[2.4rem] leading-tight sm:text-6xl">{site.invite.heading}</h2>
        <div className="mt-8 flex justify-center">
          <InviteButton iconClass="h-5 w-5" className="min-h-[56px] w-full text-lg sm:w-auto sm:px-10" />
        </div>
        <p className="mx-auto mt-5 max-w-[480px] text-[15px] leading-relaxed text-cream/90">{site.invite.note}</p>
        <div className="mt-4 flex flex-col items-center justify-center gap-x-6 gap-y-1 font-semibold sm:flex-row sm:flex-wrap">
          <a href={site.links.whatsapp} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-2 px-2 text-[15px] text-marigold underline underline-offset-4 decoration-marigold/40 hover:decoration-marigold">
            <WhatsAppIcon className="h-5 w-5" /> {site.ctas.whatsapp}
          </a>
          <a href={site.links.instagramDM} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center gap-2 px-2 text-[15px] text-marigold underline underline-offset-4 decoration-marigold/40 hover:decoration-marigold">
            <InstagramIcon className="h-5 w-5" /> {site.ctas.instagram}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
