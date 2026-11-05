import { AcharyasSection } from "@/components/Acharyas";
import { AgentStrip } from "@/components/AgentStrip";
import { AppShowcase } from "@/components/AppShowcase";
import { AskPill, Footer, SectionHead } from "@/components/Chrome";
import { Pricing } from "@/components/Pricing";
import { BeforeAfter, Closing, Hero, Trust } from "@/components/Sections";
import { Journey, Numbers } from "@/components/Landing";
import { beforeAfter } from "@/content/site";

export default function Home() {
  return (
    <>
      <Hero />
      <main id="main">
        <section className="od-howto" id="agent">
          <div className="od-wrap">
            <SectionHead
              eyebrow="How it works"
              title={
                <>
                  Say it once. <em>It gets done.</em>
                </>
              }
              lead="One voice note from the captain. The agent plans the work, checks the photos, scores it and settles pay, and every step stays on the record."
            />
          </div>
          <AgentStrip />
        </section>
        <Trust />
        <Journey />
        <section className="od-section" id="product">
          <div className="od-wrap">
            <SectionHead eyebrow="The product" title="See it in the app" lead="Short recordings from OmniPulse and the Acharya app. Pick one, or let it play." />
            <AppShowcase />
          </div>
        </section>
        <Numbers />
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
