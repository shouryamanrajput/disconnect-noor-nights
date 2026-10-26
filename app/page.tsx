import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Deets from "@/components/Deets";
import RegisterForm from "@/components/RegisterForm";
import SiteFooter from "@/components/SiteFooter";

// header → hero → deets (+ dress code) → registration form
// → footer
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
    </>
  );
}
