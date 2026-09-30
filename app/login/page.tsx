import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/Chrome";
import { LoginForm } from "@/components/LoginForm";
import { Steps } from "@/components/Steps";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function LoginPage() {
  return (
    <div style={{ background: "var(--page)", minHeight: "100vh" }}>
      <Nav />
      <main id="main" className="od-wrap" style={{ display: "grid", gap: 36, justifyItems: "center", padding: "48px 16px 96px" }}>
        <Steps current={1} />
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
