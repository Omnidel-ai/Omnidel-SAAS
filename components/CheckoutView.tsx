"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { addOns, inr, plans } from "@/content/site";
import { getSession, signOut, type Session } from "@/lib/auth";
import { orderFromQuery, orderToQuery, orderTotal } from "@/lib/order";
import { Steps } from "./Steps";

/** The order summary. Buying needs a verified OmniDEL ID, so no session → /login first. */
export function CheckoutView() {
  const router = useRouter();
  const params = useSearchParams();
  const order = orderFromQuery(new URLSearchParams(params.toString()));
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) router.replace(`/login?next=${encodeURIComponent(`/checkout?${orderToQuery(order)}`)}`);
    else setSession(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return <p className="od-small" style={{ textAlign: "center" }}>Checking your OmniDEL ID…</p>;
  const plan = plans.find((p) => p.id === order.plan)!;
  const lines = [{ name: plan.name, price: plan.price[order.billing] }, ...order.addOns.map((id) => { const a = addOns.find((x) => x.id === id)!; return { name: a.name, price: a.price }; })];

  return (
    <div style={{ display: "grid", gap: 36, justifyItems: "center" }}>
      <Steps current={2} />
      <div className="od-auth" style={{ width: "min(520px, 100%)" }}>
        <span className="od-eyebrow">Your order</span>
        <div style={{ display: "grid", gap: 10, fontSize: 15 }}>
          {lines.map((l) => (
            <div key={l.name} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{l.name}</span>
              <b>{inr(l.price)}</b>
            </div>
          ))}
          <div className="od-plan__rule" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span className="od-small">per worker / month · billed {order.billing}</span>
            <span className="od-addon__price">{inr(orderTotal(order))}</span>
          </div>
        </div>
        <p className="od-small">GST extra. Change or cancel at the end of any month.</p>
        {/* TODO: hand the order to the payment gateway here. */}
        <button className="od-btn od-btn--primary od-btn--block" type="button" onClick={() => setNote("Payments are not connected yet — our team will call you to finish setup.")}>
          Pay &amp; invite your crew
        </button>
        {note ? <p role="status" className="od-small" style={{ color: "var(--green-deep)" }}>{note}</p> : null}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--ink-soft)" }}>
          <span>Logged in as {session.phone}</span>
          <button type="button" className="od-link" style={{ background: "none", border: 0, cursor: "pointer", fontSize: 13 }} onClick={() => { signOut(); router.push("/login"); }}>
            Not you?
          </button>
        </div>
        <Link className="od-link" href="/pricing" style={{ justifySelf: "center", fontSize: 14 }}>
          ← Change plan
        </Link>
      </div>
    </div>
  );
}
