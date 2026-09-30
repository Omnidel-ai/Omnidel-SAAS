import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/CheckoutView";
import { Nav } from "@/components/Chrome";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div style={{ background: "var(--page)", minHeight: "100vh" }}>
      <Nav current="Pricing" />
      <main id="main" className="od-wrap" style={{ padding: "48px 16px 96px" }}>
        <Suspense>
          <CheckoutView />
        </Suspense>
      </main>
    </div>
  );
}
