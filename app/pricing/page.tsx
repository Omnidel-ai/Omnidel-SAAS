import type { Metadata } from "next";
import { AskPill, Footer, Nav, SectionHead } from "@/components/Chrome";
import { Pricing } from "@/components/Pricing";
import { BeforeAfter, Faq } from "@/components/Sections";
import { Steps } from "@/components/Steps";

export const metadata: Metadata = {
  title: "Pricing",
  description: "OmniPulse and OmniPulse + Velocity plans, with OmniMart, OmniStudio and OmniAds add-ons.",
};

export default function PricingPage() {
  return (
    <>
      <section className="od-hero" style={{ paddingBottom: 40 }}>
        <div className="od-scene-wrap od-scene-wrap--fade" style={{ height: 620, opacity: 0.8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="od-scene" src="/scenes/hero.svg" alt="" />
        </div>
        <Nav current="Pricing" />
        <main id="main" className="od-wrap" style={{ position: "relative", paddingTop: 64 }}>
          <Pricing />
          <div style={{ marginTop: 48 }}>
            <Steps current={0} />
          </div>
        </main>
      </section>
      <section className="od-section od-section--band">
        <div className="od-wrap">
          <SectionHead eyebrow="Value for money" title="Is it worth it?" lead="Same crew, same site. Now the work is seen." />
          <BeforeAfter />
        </div>
      </section>
      <section className="od-section">
        <div className="od-wrap">
          <SectionHead eyebrow="FAQ" title="Questions, answered" />
          <Faq />
        </div>
      </section>
      <Footer />
      <AskPill />
    </>
  );
}
