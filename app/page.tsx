import { Hero } from "@/components/sections/Hero";
import { WhyRing } from "@/components/sections/WhyRing";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { UseCases } from "@/components/sections/UseCases";
import { Specs } from "@/components/sections/Specs";
import { Roadmap } from "@/components/sections/Roadmap";
// import { Team } from "@/components/sections/Team"; // 06 — The Atelier (暂时隐藏)
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <WhyRing />
      <HowItWorks />
      <UseCases />
      <Specs />
      <Roadmap />
      {/* <Team /> 06 — The Atelier (暂时隐藏) */}
      <CTA />
      <Footer />
    </main>
  );
}
