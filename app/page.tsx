import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Deets from "@/components/Deets";
import RegisterForm from "@/components/RegisterForm";
import SiteFooter from "@/components/SiteFooter";
import MobileCTABar from "@/components/MobileCTABar";

// header → hero → deets (+ scene chips + dress code) → registration form
// → footer → mobile CTA bar
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-x-clip">
        <Hero />
        <Deets />
        <RegisterForm />
      </main>
      <SiteFooter />
      <MobileCTABar />
    </>
  );
}
