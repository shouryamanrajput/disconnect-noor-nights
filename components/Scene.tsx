import type { CSSProperties } from "react";
import Image from "next/image";
import { site } from "@/lib/config";
import { Ornament } from "@/components/Decor";
import FestiveBackdrop from "@/components/FestiveBackdrop";
import InviteButton from "@/components/InviteButton";

// One line icon per card, in the order of site.scene.cards:
// diya, headphones, cloche, golgappa bowl, playing cards, music notes,
// two sparkles, heart.
const cardIcons = [
  "M3 13h18c0 4-4 6.5-9 6.5S3 17 3 13ZM12 3.5c1.6 2 2.2 3.3 2.2 4.5a2.2 2.2 0 0 1-4.4 0c0-1.2.6-2.5 2.2-4.5Z",
  "M4 15v-3a8 8 0 0 1 16 0v3M4 15a2 2 0 0 1 2-2h1v7H6a2 2 0 0 1-2-2v-3ZM20 15a2 2 0 0 0-2-2h-1v7h1a2 2 0 0 0 2-2v-3Z",
  "M3 18h18M5 18a7 7 0 0 1 14 0M12 9V7M10.5 7h3",
  "M3.5 12h17a8.5 8.5 0 0 1-17 0ZM7 12a2.5 2.5 0 0 1 5 0M12 12a2.5 2.5 0 0 1 5 0M9.5 8.5a2.5 2.5 0 0 1 5 0",
  "M9 3h9a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM5.5 6.5 4 7l3.5 13.5 6-1.5M13.5 7.5c-1.3 1.3-2 2.4-2 3.3a2 2 0 0 0 4 0c0-.9-.7-2-2-3.3Z",
  "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  "M9 3c.4 3.4 2.2 5.2 5.6 5.6-3.4.4-5.2 2.2-5.6 5.6-.4-3.4-2.2-5.2-5.6-5.6C6.8 8.2 8.6 6.4 9 3ZM17.5 13c.3 2 1.3 3 3.3 3.3-2 .3-3 1.3-3.3 3.3-.3-2-1.3-3-3.3-3.3 2-.3 3-1.3 3.3-3.3Z",
  "M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9Z",
];

// Gift box (Helios sticker).
const giftIcon = "M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9ZM3 7h18v4H3ZM12 7v14M12 7C10.5 4 7 3.5 7 5.8 7 7 9 7 12 7Zm0 0c1.5-3 5-3.5 5-1.2C17 7 15 7 12 7Z";
const star = "M12 0c.7 6.6 4.7 10.6 12 12-7.3 1.4-11.3 5.4-12 12-.7-6.6-4.7-10.6-12-12C7.3 10.6 11.3 6.6 12 0Z";

// Reveal stagger: each card waits a little longer (see .reveal-on in globals.css).
const delay = (i: number) => ({ "--rd": `${(i % 3) * 90}ms` }) as CSSProperties;

// Round die-cut sticker: cream edge, plum disc, the white Helios logo in the
// middle, "exciting gift hampers by Helios" turning round the rim, sparkles
// twinkling around it. Tilted; straightens and grows a little on hover.
function HeliosSticker() {
  const g = site.scene.gift;
  return (
    <a
      href={g.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${g.ring} (opens the Helios website)`}
      className="group relative block h-[148px] w-[148px] shrink-0 sm:h-[172px] sm:w-[172px]"
    >
      {[
        "-left-4 top-2 h-5 w-5",
        "-right-3 top-6 h-3.5 w-3.5",
        "-left-1 bottom-1 h-3 w-3",
        "-right-5 bottom-8 h-5 w-5",
      ].map((pos, i) => (
        <svg key={pos} viewBox="0 0 24 24" aria-hidden className={`bd-twinkle absolute text-marigold ${pos}`} style={{ animationDelay: `${-i * 0.8}s` }}>
          <path d={star} fill="currentColor" />
        </svg>
      ))}
      <span className="sticker-float block h-full w-full">
        <span className="sticker-tilt block h-full w-full rounded-full bg-cream p-[5px] shadow-[0_10px_24px_rgba(20,3,36,0.45),0_2px_0_#356428]">
          <span className="relative block h-full w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_30%,#8a2fb0_0%,#4E1470_58%,#33094A_100%)] shadow-[inset_0_0_0_2px_#FBE212]">
            <svg viewBox="0 0 200 200" aria-hidden className="sticker-spin absolute inset-0 h-full w-full">
              <defs>
                <path id="helios-ring" d="M100,100 m-77,0 a77,77 0 1,1 154,0 a77,77 0 1,1 -154,0" />
              </defs>
              <text className="font-sans" fontSize="14" fontWeight="800" fill="#FBE212">
                <textPath href="#helios-ring" textLength="470" lengthAdjust="spacing">
                  {`${g.ring.toUpperCase()}  ✦  `}
                </textPath>
              </text>
            </svg>
            <span aria-hidden className="absolute inset-[21%] rounded-full border border-dashed border-marigold/60" />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-marigold sm:h-6 sm:w-6" aria-hidden>
                <path d={giftIcon} />
              </svg>
              <Image src={g.logo} alt="Helios" width={640} height={180} sizes="96px" className="h-auto w-[50%]" />
              <span className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-cream/85 sm:text-[9.5px]">{g.label.replace(" by", "")}</span>
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}

// Photo cards in the poster palette: marigold-rimmed, photo + icon, short
// title and line, panels alternating plum / coral like the deets bar and
// dress-code strip.
// Phones: first and last cards full width (photo beside text), the rest 2-up
// with the photo on top. Tablets: photo beside text throughout.
// Desktop: 3×3 bento — the portrait decor photo as a tall card on the left.
export default function Scene() {
  const sc = site.scene;
  const last = sc.cards.length - 1;
  return (
    <section id="scene" className="bg-royal-tex relative scroll-mt-12 overflow-hidden pb-8 pt-8 sm:scroll-mt-14 sm:pb-12 sm:pt-14">
      <FestiveBackdrop variant="full" inner={680} />
      <div className="container-px relative z-10 max-w-content lg:max-w-container">
        <div data-reveal className="text-center">
          <h2 className="gold-text font-display text-[1.75rem] uppercase leading-tight sm:text-[2.4rem] lg:text-[2.8rem]">{sc.heading}</h2>
          <Ornament className="mt-1" />
          <p className="mt-2 font-sans text-[14px] font-extrabold leading-snug text-cream [text-wrap:balance] sm:text-[16px] lg:text-[18px]">{sc.intro}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-cream/85 [text-wrap:balance] sm:text-[14.5px] lg:text-[16px]">{sc.subline}</p>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {sc.cards.map((c, i) => {
            const feature = i === 0;
            const wide = feature || i === last; // full width on phones/tablets
            const coral = i % 2 === 1;
            const layout = feature
              ? "col-span-2 grid grid-cols-[46%_1fr] sm:grid-cols-[42%_1fr] lg:col-span-1 lg:row-span-2 lg:flex lg:flex-col"
              : wide
                ? "col-span-2 grid grid-cols-[46%_1fr] sm:grid-cols-[42%_1fr] lg:col-span-1 lg:flex lg:flex-col"
                : "flex flex-col sm:grid sm:grid-cols-[44%_1fr] lg:flex";
            const photo = feature
              ? "min-h-[180px] sm:min-h-[240px] lg:min-h-[300px] lg:flex-1"
              : wide
                ? "min-h-[160px] sm:min-h-[210px] lg:aspect-[16/10] lg:min-h-0"
                : "aspect-[4/3] sm:aspect-auto sm:min-h-[170px] lg:aspect-[16/10] lg:min-h-0";
            return (
              <li
                key={c.title}
                data-reveal
                style={delay(i)}
                className={`group overflow-hidden rounded-2xl border-2 border-marigold/60 shadow-[0_6px_14px_rgba(20,3,36,0.25)] hover:border-marigold hover:shadow-[0_12px_28px_rgba(20,3,36,0.45)] lg:hover:[translate:0_-5px] ${layout}`}
              >
                <div className={`relative overflow-hidden ${photo}`}>
                  <Image
                    src={c.image}
                    alt={c.alt}
                    fill
                    sizes={wide ? "(min-width: 1024px) 380px, (min-width: 640px) 42vw, 46vw" : "(min-width: 1024px) 380px, (min-width: 640px) 40vw, 50vw"}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  {/* soft shade toward the panel so the photo sits into the frame */}
                  <div aria-hidden className={`pointer-events-none absolute inset-0 ${wide ? "bg-gradient-to-r from-transparent from-60% to-[rgba(51,9,74,0.35)] lg:bg-gradient-to-b" : "bg-gradient-to-b from-transparent from-60% to-[rgba(51,9,74,0.35)] sm:bg-gradient-to-r lg:bg-gradient-to-b"}`} />
                </div>
                <div className={`flex flex-1 flex-col justify-center px-3 py-3 sm:px-5 sm:py-4 lg:justify-start ${feature ? "lg:flex-none lg:py-5" : ""} ${coral ? "bg-gradient-to-br from-coral to-rani" : "bg-plum/60"}`}>
                  <span className={`grid shrink-0 place-items-center rounded-md bg-marigold text-plum transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${feature ? "h-7 w-7 sm:h-9 sm:w-9 sm:rounded-lg" : "h-6 w-6 sm:h-8 sm:w-8 sm:rounded-lg"}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={feature ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3.5 w-3.5 sm:h-[18px] sm:w-[18px]"} aria-hidden>
                      <path d={cardIcons[i]} />
                    </svg>
                  </span>
                  <h3 className={`mt-2 font-display uppercase leading-tight text-marigold ${feature ? "text-[1.2rem] sm:text-[1.7rem] lg:text-[1.8rem]" : "text-[1rem] sm:text-[1.3rem] lg:text-[1.3rem]"}`}>{c.title}</h3>
                  <p className={`mt-1 leading-snug text-cream ${feature ? "text-[13.5px] sm:text-[15px] lg:text-[16px]" : "text-[13px] sm:text-[14px]"}`}>{c.body}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div data-reveal className="mt-8 flex flex-col items-center gap-5 sm:mt-12 sm:flex-row sm:justify-center sm:gap-14">
          <HeliosSticker />
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <p className="gold-text font-display text-[1.4rem] uppercase leading-tight sm:text-[2rem]">{sc.closing}</p>
            <InviteButton className="min-h-[48px] w-full max-w-[230px] sm:w-auto sm:max-w-none sm:px-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
