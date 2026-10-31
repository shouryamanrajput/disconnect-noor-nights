import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Scene from "@/components/Scene";
import Deets from "@/components/Deets";
import { MarqueeCross, MarqueeStrip } from "@/components/Marquee";
import RegisterForm from "@/components/RegisterForm";
import RegistrationClosed from "@/components/RegistrationClosed";
import { site } from "@/lib/config";
import SiteFooter from "@/components/SiteFooter";

// header → hero → running strip → deets (+ dress code) → the scene (photo
// cards + Helios sticker) → crossed running strips → registration form
// → footer. While site.registrationsOpen is false the form (and its payment
// step) is not rendered; a "Registrations are closed" card takes its place.
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
        {site.registrationsOpen ? <RegisterForm /> : <RegistrationClosed />}
      </main>
      <SiteFooter />
    </>
  );
}
