"use client";

import Link from "next/link";
import { useState } from "react";
import { addOns, inr, plans, pricingCopy, type AddOnId, type Billing, type PlanId } from "@/content/site";
import { orderToQuery, orderTotal } from "@/lib/order";
import { Icon } from "./Icon";

export function Pricing({ showAddOns = true }: { showAddOns?: boolean }) {
  const [billing, setBilling] = useState<Billing>("monthly");
  const plan: PlanId = "velocity";
  const [chosen, setChosen] = useState<AddOnId[]>(["mart"]);
  const order = { plan, billing, addOns: chosen };
  const checkout = (p: PlanId) => `/checkout?${orderToQuery({ ...order, plan: p })}`;
  const toggle = (id: AddOnId) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const planName = plans.find((p) => p.id === plan)?.name;

  return (
    <>
      <div className="od-price-head">
        <span className="od-eyebrow">{pricingCopy.eyebrow}</span>
        <h2 className="od-display">
          {pricingCopy.title[0]}
          <em>{pricingCopy.title[1]}</em>
          {pricingCopy.title[2]}
        </h2>
        <p className="od-lead">{pricingCopy.lead}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", margin: "-8px 0 44px" }}>
        <div className="od-switch" role="group" aria-label="Billing period">
          <button type="button" className="lbl" aria-pressed={billing === "monthly"} onClick={() => setBilling("monthly")}>
            Monthly
          </button>
          <button
            type="button"
            className="od-switch__track"
            role="switch"
            aria-checked={billing === "yearly"}
            aria-label="Bill yearly"
            onClick={() => setBilling((b) => (b === "yearly" ? "monthly" : "yearly"))}
          />
          <button type="button" className="lbl" aria-pressed={billing === "yearly"} onClick={() => setBilling("yearly")}>
            Yearly
          </button>
          <span className="od-save">{pricingCopy.yearlySave}</span>
        </div>
      </div>

      <div className="od-plans2">
        {plans.map((p) => (
          <article
            key={p.id}
            className={`od-plan od-plan2${p.featured ? " od-plan--featured od-plan2--featured" : ""}`}
          >
            <div className="od-plan2__tab">{p.tab}</div>
            {p.featured ? (
              <span className="od-ribbon">
                −20%<small>YEARLY</small>
              </span>
            ) : null}
            <div className="od-plan2__body">
              <span className="od-plan2__icon">
                <Icon name={p.featured ? "rocket" : "seed"} />
              </span>
              <div>
                <h3 className="od-plan2__name">{p.name}</h3>
                <p className="od-plan2__for">{p.for}</p>
              </div>
              <div className="od-plan2__price">
                <sup>₹</sup>
                <span>{p.price[billing].toLocaleString("en-IN")}</span>
                <small>/ worker / month</small>
              </div>
              <p className="od-plan2__note">{billing === "yearly" ? "Billed yearly" : "Billed monthly"} · GST extra</p>
              <Link className={`od-btn ${p.featured ? "od-btn--primary" : "od-btn--ink"} od-btn--block`} href={checkout(p.id)}>
                Log in to buy
              </Link>
              <ul className="od-arrows">
                {p.lead ? <li className="lead">{p.lead}</li> : null}
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="od-plan2__foot">
                <Icon name="lock" className="od-lock" />
                {pricingCopy.loginNote}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="od-enterprise">
        <div>
          <span className="od-eyebrow">{pricingCopy.enterprise.eyebrow}</span>
          <p className="od-body" style={{ marginTop: 4, color: "var(--ink)" }}>
            {pricingCopy.enterprise.text}
          </p>
        </div>
        <a className="od-btn od-btn--secondary od-btn--sm" href="mailto:ram.badrinathan@jvl.run?subject=OmniDEL%20enterprise">
          {pricingCopy.enterprise.cta}
        </a>
      </div>

      {showAddOns ? (
        <>
          <div className="od-head" style={{ marginTop: 96 }}>
            <span className="od-eyebrow">Add-ons</span>
            <h2 className="od-display" style={{ fontSize: 40 }}>
              {pricingCopy.addOnsTitle}
            </h2>
            <p className="od-lead">{pricingCopy.addOnsLead}</p>
          </div>
          <div className="od-addons">
            {addOns.map((a) => {
              const on = chosen.includes(a.id);
              return (
                <article key={a.id} className="od-addon od-addon--slim" role="checkbox" aria-checked={on}>
                  <div className="od-addon__top">
                    <span className="od-addon__icon" style={{ background: a.tint, color: a.ink }}>
                      <Icon name={a.icon} />
                    </span>
                    <span className="od-addon__price">
                      +{inr(a.price)}
                      <small> /mo</small>
                    </span>
                  </div>
                  <div>
                    <h3 className="od-h3">{a.name}</h3>
                    <p className="od-small" style={{ marginTop: 4 }}>
                      {a.line}
                    </p>
                  </div>
                  <button className="od-addon__btn" type="button" onClick={() => toggle(a.id)}>
                    {on ? "✓ Added" : "+ Add to plan"}
                  </button>
                </article>
              );
            })}
          </div>
          <div className="od-summary" aria-live="polite">
            <div>
              <div className="od-summary__items">
                <b>{planName}</b>
                {chosen.map((id) => ` · ${addOns.find((a) => a.id === id)?.name}`)}
              </div>
              <div className="od-summary__total">
                {inr(orderTotal(order))} <small>per worker / month</small>
              </div>
            </div>
            <Link className="od-btn od-btn--on-dark" href={checkout(plan)}>
              <Icon name="lock" className="od-lock" /> Log in to continue
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}
