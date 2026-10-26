import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Scene from "@/components/Scene";
import Deets from "@/components/Deets";
import InviteCTA from "@/components/InviteCTA";
import SiteFooter from "@/components/SiteFooter";
import MobileCTABar from "@/components/MobileCTABar";

// header → hero → what's the scene → deets (+ dress code) → final invite CTA
// → footer → mobile CTA bar
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-x-clip">
        <Hero />
        <Scene />
        <Deets />
        <InviteCTA />
      </main>
      <SiteFooter />
      <MobileCTABar />
    </>
  );
}
