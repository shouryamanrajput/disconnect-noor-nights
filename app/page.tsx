import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Scene from "@/components/Scene";
import Deets from "@/components/Deets";
import { MarqueeCross, MarqueeStrip } from "@/components/Marquee";
import RegisterForm from "@/components/RegisterForm";
import SiteFooter from "@/components/SiteFooter";

// header → hero → running strip → deets (+ dress code) → the scene (photo
// cards + Helios sticker) → crossed running strips → registration form
// → footer
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-x-clip">
        <Hero />
        <MarqueeStrip />
        <Deets />
        <Scene />
        <MarqueeCross />
        <RegisterForm />
      </main>
      <SiteFooter />
    </>
  );
}
