import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/Chrome";
import { RegisterWizard } from "@/components/RegisterWizard";

export const metadata: Metadata = { title: "Get your OmniDEL instance", robots: { index: false } };

export default function RegisterPage() {
  return (
    <div style={{ background: "var(--page)", minHeight: "100vh" }}>
      <Nav />
      <main id="main" className="od-wrap od-reg">
        <Suspense>
          <RegisterWizard />
        </Suspense>
      </main>
    </div>
  );
}
