"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { requestOtp, verifyOtp } from "@/lib/auth";
import { Brand } from "./Chrome";

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/pricing";
  const [phone, setPhone] = useState("+91 ");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!sent) {
        await requestOtp(phone);
        setSent(true);
      } else {
        await verifyOtp(phone, code);
        // Only same-site paths are allowed as a destination.
        router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/pricing");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="od-auth" onSubmit={submit} noValidate>
      <div style={{ display: "grid", gap: 6 }}>
        <Brand />
        <h1 className="od-h2" style={{ marginTop: 14 }}>
          Log in to buy
        </h1>
        <p className="od-small">Plans are attached to your verified OmniDEL ID.</p>
      </div>
      <div className="od-field">
        <label htmlFor="phone">Mobile number</label>
        <input id="phone" className="od-input" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={sent} />
      </div>
      {sent ? (
        <div className="od-field">
          <label htmlFor="otp">6-digit code</label>
          <input id="otp" className="od-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} autoFocus />
          <span className="od-small">Sent to {phone}. Demo: any 6 digits work.</span>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="od-small" style={{ color: "var(--crit)" }}>
          {error}
        </p>
      ) : null}
      <button className="od-btn od-btn--primary od-btn--block" type="submit" disabled={busy}>
        {busy ? "Please wait…" : sent ? "Verify & continue" : "Send OTP"}
      </button>
      {sent ? (
        <button type="button" className="od-link" style={{ background: "none", border: 0, cursor: "pointer", justifySelf: "center" }} onClick={() => { setSent(false); setCode(""); }}>
          Use a different number
        </button>
      ) : null}
    </form>
  );
}
