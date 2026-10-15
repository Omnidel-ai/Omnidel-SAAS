import type { Metadata } from "next";
import { AcharyaHero, AcharyaScreens, CapabilitiesSection, ListenSection, OtherAcharyas } from "@/components/AcharyaPage";
import { Footer, Nav } from "@/components/Chrome";

export const metadata: Metadata = {
  title: "Acharya Ji · your 24/7 AI Acharya",
  description: "Meet Acharya Ji: an AI mentor that knows your company, helps with everyday work and speaks your crew’s language.",
};

export default function AcharyaPageRoute() {
  return (
    <>
      <section className="od-hero od-hero--calm">
        <Nav current="Acharyas" />
        <AcharyaHero />
      </section>
      <main id="main">
        <ListenSection />
        <CapabilitiesSection />
        <AcharyaScreens />
        <OtherAcharyas />
      </main>
      <Footer />
    </>
  );
}
