import { AcharyasSection } from "@/components/Acharyas";
import { AgentStrip } from "@/components/AgentStrip";
import { AppShowcase } from "@/components/AppShowcase";
import { AskPill, Footer, SectionHead } from "@/components/Chrome";
import { Pricing } from "@/components/Pricing";
import { BeforeAfter, Closing, Hero, Trust } from "@/components/Sections";
import { beforeAfter } from "@/content/site";

export default function Home() {
  return (
    <>
      <Hero />
      <main id="main">
        <AgentStrip />
        <Trust />
        <section className="od-section" id="product">
          <div className="od-wrap">
            <SectionHead eyebrow="The product" title="See it in the app" lead="Real screens from OmniPulse and OmniVarsity." />
            <AppShowcase />
          </div>
        </section>
        <AcharyasSection />
        <section className="od-section od-section--band">
          <div className="od-wrap">
            <SectionHead eyebrow={beforeAfter.eyebrow} title={beforeAfter.title} lead={beforeAfter.lead} />
            <BeforeAfter />
          </div>
        </section>
        <section className="od-section" id="pricing">
          <div className="od-wrap">
            <Pricing />
          </div>
        </section>
        <Closing />
      </main>
      <Footer />
      <AskPill />
    </>
  );
}
