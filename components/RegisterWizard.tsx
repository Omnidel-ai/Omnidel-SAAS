"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { planCopy } from "@/content/site";
import { STATES, TEAM_SIZES, TRADES, prefixProblem, suggestPrefix } from "@/lib/register";
import { Brand } from "./Chrome";
import { Steps } from "./Steps";

type Stage = "phone" | "otp" | "details" | "address" | "plan" | "pay" | "done";
type Billing = "monthly" | "yearly";
interface Catalog {
  plans: { slug: string; name: string; priceInrMonthly: number; priceInrYearlyPerMonth: number; seatLimit: number; modules: string[] }[];
  addons: { module: string; name: string; priceInrMonthly: number }[];
  yearlyDiscountPercent: number;
}
interface Availability { prefix: string; available: boolean; reason: string | null; suggestion: string | null; url: string }
interface Result { prefix: string; url: string; status: string; orderId: string; amountInr: number; paymentReference: string }
interface Details { ownerName: string; email: string; businessName: string; trade: string; city: string; state: string; teamSize: string; gstin: string }

const LABELS = ["Verify", "Your business", "Address", "Plan", "Pay"] as const;
const STAGE_STEP: Record<Stage, number> = { phone: 0, otp: 0, details: 1, address: 2, plan: 3, pay: 4, done: 5 };
const DOMAIN = "omnidel.online";
/** The add-on ids the pricing page puts in the link, and the module slug the API knows each by. */
const PRICING_ADDON_TO_MODULE: Record<string, string> = { mart: "omnimart", studio: "omnistudio", ads: "omniads" };
/** Rupees, with paise only when there are any: ₹1,198 or ₹1,198.40. */
const rupees = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
/** What one month of a list price costs on the chosen billing: yearly takes the discount off. */
const perMonth = (monthly: number, billing: Billing, discount: number) => (billing === "yearly" ? Math.round(monthly * (100 - discount)) / 100 : monthly);

/** One call to this site's own register routes. Resolves to the item, or throws a readable message. */
class CallError extends Error {
  constructor(message: string, readonly code: string) { super(message); }
}
async function call<T>(path: string, init?: { method: "POST"; body: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/register/${path}`, init ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(init.body) } : undefined);
  } catch {
    throw new CallError("We could not reach OmniDEL. Check your connection and try again.", "NETWORK");
  }
  const json = (await res.json().catch(() => null)) as { item?: T; error?: { code?: string; message?: string } } | null;
  if (res.ok && json?.item !== undefined) return json.item;
  throw new CallError(json?.error?.message ?? "Something went wrong. Please try again.", json?.error?.code ?? "ERROR");
}

export function RegisterWizard() {
  const params = useSearchParams();
  const [stage, setStage] = useState<Stage>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [details, setDetails] = useState<Details>({ ownerName: "", email: "", businessName: "", trade: "", city: "", state: "", teamSize: "", gstin: "" });
  const [prefix, setPrefix] = useState("");
  const [prefixEdited, setPrefixEdited] = useState(false);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [planSlug, setPlanSlug] = useState(params.get("plan") ?? "");
  const [billing, setBilling] = useState<Billing>(params.get("billing") === "yearly" ? "yearly" : "monthly");
  const [addons, setAddons] = useState<string[]>((params.get("addons") ?? "").split(",").filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus to the new step's heading so keyboard and screen-reader users follow along.
  useEffect(() => { heading.current?.focus(); }, [stage]);
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const loadCatalog = useCallback(() => {
    setCatalogError(null);
    call<Catalog>("catalog").then(
      (c) => {
        setCatalog(c);
        setPlanSlug((slug) => (c.plans.some((p) => p.slug === slug) ? slug : (c.plans.find((p) => p.slug === "velocity") ?? c.plans[0])?.slug ?? ""));
        // The pricing page's add-on ids become the API's module slugs; anything unknown is dropped, never passed through.
        setAddons((list) => [...new Set(list.map((m) => PRICING_ADDON_TO_MODULE[m] ?? m).filter((m) => c.addons.some((a) => a.module === m)))]);
      },
      (e: Error) => setCatalogError(e.message),
    );
  }, []);
  useEffect(loadCatalog, [loadCatalog]);

  const plan = catalog?.plans.find((p) => p.slug === planSlug);
  /** Add-ons the plan already includes cost nothing and are never bought again. */
  const paidAddons = useMemo(() => (plan ? addons.filter((m) => !plan.modules.includes(m)) : addons), [plan, addons]);
  const total = useMemo(() => {
    if (!catalog || !plan) return null;
    const monthly = plan.priceInrMonthly + catalog.addons.filter((a) => paidAddons.includes(a.module)).reduce((s, a) => s + a.priceInrMonthly, 0);
    const charge = billing === "yearly" ? Math.round(monthly * 12 * (100 - catalog.yearlyDiscountPercent)) / 100 : monthly;
    return { monthly, charge, perMonth: billing === "yearly" ? charge / 12 : monthly };
  }, [catalog, plan, paidAddons, billing]);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); } finally { setBusy(false); }
  }

  const sendCode = () => run(async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) throw new Error("Enter your 10-digit mobile number.");
    const r = await call<{ resendAfter?: number }>("otp-request", { method: "POST", body: { phone } });
    setResendIn(typeof r.resendAfter === "number" ? Math.min(Math.max(r.resendAfter, 0), 120) : 30);
    setCode("");
    setStage("otp");
  });
  const verify = () => run(async () => {
    if (!/^\d{6}$/.test(code)) throw new Error("Enter the 6-digit code.");
    try {
      await call("otp-verify", { method: "POST", body: { phone, code } });
    } catch (e) {
      if (e instanceof CallError && e.code === "AUTH.TOKEN_INVALID") throw new Error("That code is not right. Check it and try again.");
      throw e;
    }
    setStage("details");
  });

  function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    const d = details;
    if (!d.ownerName.trim() || !d.businessName.trim() || !d.city.trim() || !d.trade || !d.state || !d.teamSize) return setError("Fill in every field marked required.");
    if (!/^\S+@\S+\.\S+$/.test(d.email.trim())) return setError("Enter a valid email address.");
    if (d.gstin && !/^[0-9]{2}[A-Z0-9]{13}$/.test(d.gstin.trim().toUpperCase())) return setError("A GSTIN has 15 characters, starting with 2 digits. Leave it empty if you do not have one.");
    setError(null);
    if (!prefixEdited) setPrefix(suggestPrefix(d.businessName));
    setStage("address");
  }

  const pay = () => run(async () => {
    if (!plan) throw new Error("Choose a plan first.");
    try {
      const r = await call<Result>("submit", {
        method: "POST",
        body: { phone, ...details, teamSize: details.teamSize.replace("–", "-"), ownerName: details.ownerName.trim(), email: details.email.trim(), businessName: details.businessName.trim(), city: details.city.trim(), gstin: details.gstin.trim().toUpperCase() || null, prefix, planSlug: plan.slug, billing, addons: paidAddons },
      });
      setResult(r);
      setStage("done");
    } catch (e) {
      if (e instanceof CallError && e.code === "RESOURCE.CONFLICT") { setStage("address"); throw e; }
      if (e instanceof CallError && e.code === "AUTH.TOKEN_INVALID") { setStage("phone"); throw new Error("Your number check has expired. Verify your number again to continue."); }
      throw e;
    }
  });

  const set = (k: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDetails((d) => ({ ...d, [k]: e.target.value }));
  const err = error ? <p role="alert" className="od-small od-reg__err">{error}</p> : null;
  const head = (title: string, sub?: string) => (
    <div className="od-reg__head">
      <h1 className="od-h2" ref={heading} tabIndex={-1}>{title}</h1>
      {sub ? <p className="od-small">{sub}</p> : null}
    </div>
  );
  const back = (to: Stage) => (
    <button type="button" className="od-reg__back" disabled={busy} onClick={() => { setError(null); setStage(to); }}>← Back</button>
  );

  return (
    <div className="od-reg__col">
      <Steps current={Math.min(STAGE_STEP[stage], LABELS.length - 1)} labels={stage === "done" ? ["Done"] : LABELS} />

      {(stage === "phone" || stage === "otp") && (
        <form className="od-auth od-reg__card" noValidate onSubmit={(e) => { e.preventDefault(); void (stage === "phone" ? sendCode() : verify()); }}>
          <Brand />
          {head(stage === "phone" ? "Start with your mobile number" : "Enter the 6-digit code", stage === "phone" ? "We send a code to check it is you. Your OmniDEL sign-in uses this number." : `We sent a code to +91 ${phone}.`)}
          {stage === "phone" ? (
            <div className="od-field">
              <label htmlFor="phone">Mobile number</label>
              <div className="od-reg__phone">
                <span className="od-input od-reg__cc" aria-hidden="true">+91</span>
                <input id="phone" className="od-input" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
              </div>
            </div>
          ) : (
            <div className="od-field">
              <label htmlFor="otp">6-digit code</label>
              <input id="otp" className="od-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} autoFocus />
            </div>
          )}
          {err}
          <button className="od-btn od-btn--primary od-btn--block" type="submit" disabled={busy}>{busy ? "Please wait…" : stage === "phone" ? "Send code" : "Verify and continue"}</button>
          {stage === "otp" ? (
            <div className="od-reg__row">
              <button type="button" className="od-reg__back" onClick={() => { setError(null); setStage("phone"); }}>Use a different number</button>
              <button type="button" className="od-reg__back" disabled={busy || resendIn > 0} onClick={() => void sendCode()}>{resendIn > 0 ? `Send again in ${resendIn}s` : "Send again"}</button>
            </div>
          ) : null}
        </form>
      )}

      {stage === "details" && (
        <form className="od-auth od-reg__card od-reg__card--wide" noValidate onSubmit={submitDetails}>
          {head("Tell us about your business", "This sets up your OmniDEL account.")}
          <div className="od-field">
            <label htmlFor="verified">Mobile number</label>
            <input id="verified" className="od-input" value={`+91 ${phone}  ✓ verified`} readOnly />
          </div>
          <div className="od-reg__grid">
            <div className="od-field"><label htmlFor="ownerName">Owner name *</label><input id="ownerName" className="od-input" autoComplete="name" value={details.ownerName} onChange={set("ownerName")} /></div>
            <div className="od-field"><label htmlFor="email">Email *</label><input id="email" className="od-input" type="email" autoComplete="email" value={details.email} onChange={set("email")} /></div>
            <div className="od-field"><label htmlFor="businessName">Business name *</label><input id="businessName" className="od-input" autoComplete="organization" value={details.businessName} onChange={set("businessName")} /></div>
            <div className="od-field"><label htmlFor="trade">Trade / type of work *</label>
              <select id="trade" className="od-input" value={details.trade} onChange={set("trade")}><option value="">Choose…</option>{TRADES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="od-field"><label htmlFor="city">City *</label><input id="city" className="od-input" autoComplete="address-level2" value={details.city} onChange={set("city")} /></div>
            <div className="od-field"><label htmlFor="state">State *</label>
              <select id="state" className="od-input" autoComplete="address-level1" value={details.state} onChange={set("state")}><option value="">Choose…</option>{STATES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="od-field"><label htmlFor="teamSize">Team size *</label>
              <select id="teamSize" className="od-input" value={details.teamSize} onChange={set("teamSize")}><option value="">Choose…</option>{TEAM_SIZES.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div className="od-field"><label htmlFor="gstin">GSTIN (optional)</label><input id="gstin" className="od-input" maxLength={15} autoCapitalize="characters" value={details.gstin} onChange={(e) => setDetails((d) => ({ ...d, gstin: e.target.value.toUpperCase() }))} /></div>
          </div>
          {err}
          <button className="od-btn od-btn--primary od-btn--block" type="submit">Continue</button>
        </form>
      )}

      {stage === "address" && (
        <AddressStep
          prefix={prefix}
          error={error}
          head={head("Choose your OmniDEL address", "Your team signs in here. Pick something your crew will remember.")}
          onChange={(p) => { setPrefix(p); setPrefixEdited(true); setError(null); }}
          onBack={back("details")}
          onNext={() => { setError(null); setStage("plan"); }}
        />
      )}

      {stage === "plan" && (
        <div className="od-auth od-reg__card od-reg__card--wide">
          {head("Pick your plan", "Switch plan any month.")}
          {catalogError ? (
            <div role="alert" className="od-reg__err od-small">{catalogError} <button type="button" className="od-link od-reg__link" onClick={loadCatalog}>Try again</button></div>
          ) : !catalog ? (
            <p className="od-small" aria-busy="true">Loading plans…</p>
          ) : (
            <>
              <div className="od-switch" role="group" aria-label="Billing period" style={{ justifySelf: "start" }}>
                <button type="button" className="lbl" aria-pressed={billing === "monthly"} onClick={() => setBilling("monthly")}>Monthly</button>
                <button type="button" className="od-switch__track" role="switch" aria-checked={billing === "yearly"} aria-label="Bill yearly" onClick={() => setBilling((b) => (b === "yearly" ? "monthly" : "yearly"))} />
                <button type="button" className="lbl" aria-pressed={billing === "yearly"} onClick={() => setBilling("yearly")}>Yearly</button>
                {catalog.yearlyDiscountPercent > 0 ? <span className="od-save">Save {catalog.yearlyDiscountPercent}%</span> : null}
              </div>
              <div className="od-reg__plans" role="radiogroup" aria-label="Plan">
                {catalog.plans.map((p) => {
                  const copy = planCopy[p.slug];
                  const on = p.slug === planSlug;
                  return (
                    <label key={p.slug} className={`od-reg__plan${on ? " is-on" : ""}`}>
                      <input type="radio" name="plan" value={p.slug} checked={on} onChange={() => setPlanSlug(p.slug)} />
                      <span className="od-reg__plan-name">{p.name}</span>
                      <span className="od-reg__plan-price">{rupees(perMonth(p.priceInrMonthly, billing, catalog.yearlyDiscountPercent))}<small> / month</small></span>
                      <span className="od-small">Up to {p.seatLimit} people{copy ? ` · ${copy.for}` : ""}</span>
                      {copy ? <ul className="od-mini">{copy.features.slice(0, 3).map((f) => <li key={f}>{f}</li>)}</ul> : null}
                    </label>
                  );
                })}
              </div>
              {catalog.addons.length > 0 ? (
                <fieldset className="od-reg__addons">
                  <legend className="od-small">Add-ons</legend>
                  {catalog.addons.map((a) => {
                    const included = plan?.modules.includes(a.module) ?? false;
                    return (
                      <label key={a.module} className="od-reg__addon">
                        <input type="checkbox" disabled={included} checked={included || addons.includes(a.module)} onChange={(e) => setAddons((l) => (e.target.checked ? [...l, a.module] : l.filter((m) => m !== a.module)))} />
                        <span>{a.name}</span>
                        {included ? <b>Included</b> : <b>+{rupees(perMonth(a.priceInrMonthly, billing, catalog.yearlyDiscountPercent))}<small> / month</small></b>}
                      </label>
                    );
                  })}
                </fieldset>
              ) : null}
              <div className="od-reg__total" aria-live="polite">
                <span className="od-small">{billing === "yearly" ? "Billed yearly" : "Billed monthly"} · GST extra</span>
                <span className="od-addon__price">{total ? (billing === "yearly" ? <>{rupees(total.charge)}<small> a year ({rupees(total.perMonth)}/month)</small></> : <>{rupees(total.monthly)}<small> / month</small></>) : "—"}</span>
              </div>
            </>
          )}
          {err}
          <div className="od-reg__row">
            {back("address")}
            <button className="od-btn od-btn--primary" type="button" disabled={!plan || total === null} onClick={() => { setError(null); setStage("pay"); }}>Continue to payment</button>
          </div>
        </div>
      )}

      {stage === "pay" && plan && total && (
        <div className="od-auth od-reg__card" aria-busy={busy}>
          {head("Review and pay")}
          <p className="od-reg__demo" role="note"><b>Demo payment</b> — no money is charged.</p>
          <div className="od-reg__lines">
            <div><span>{plan.name}</span><b>{rupees(perMonth(plan.priceInrMonthly, billing, catalog?.yearlyDiscountPercent ?? 0))}<small> / mo</small></b></div>
            {catalog?.addons.filter((a) => paidAddons.includes(a.module)).map((a) => <div key={a.module}><span>{a.name}</span><b>+{rupees(perMonth(a.priceInrMonthly, billing, catalog.yearlyDiscountPercent))}<small> / mo</small></b></div>)}
            {catalog?.addons.filter((a) => addons.includes(a.module) && plan.modules.includes(a.module)).map((a) => <div key={a.module}><span>{a.name}</span><b>Included</b></div>)}
            <div className="od-plan__rule" />
            <div><span>Address</span><b className="od-reg__mono">{prefix}.{DOMAIN}</b></div>
            <div><span>Billing</span><b>{billing === "yearly" ? "Yearly" : "Monthly"}</b></div>
          </div>
          {busy ? (
            <div className="od-reg__setup" role="status">
              <span className="od-reg__spin" aria-hidden="true" />
              <div><b>Setting up your instance…</b><p className="od-small">This can take up to a minute. Please keep this page open.</p></div>
            </div>
          ) : (
            <>
              {err}
              <button className="od-btn od-btn--primary od-btn--block" type="button" disabled={busy} onClick={() => void pay()}>Pay {rupees(total.charge)} (demo)</button>
              <div className="od-reg__row">{back("plan")}</div>
            </>
          )}
        </div>
      )}

      {stage === "done" && result && (
        <div className="od-auth od-reg__card od-reg__card--done">
          <span className="od-reg__tick" aria-hidden="true">✓</span>
          {head("Your OmniDEL instance is ready", "Your team signs in at this address.")}
          <a className="od-reg__url" href={result.url}>{result.url}</a>
          <a className="od-btn od-btn--primary od-btn--block" href={result.url}>Sign in with +91 {phone}</a>
          <dl className="od-reg__ref">
            <div><dt>Payment reference</dt><dd className="od-reg__mono">{result.paymentReference}</dd></div>
            <div><dt>Order</dt><dd className="od-reg__mono">{result.orderId}</dd></div>
            <div><dt>Amount (demo)</dt><dd>{rupees(result.amountInr)}</dd></div>
          </dl>
        </div>
      )}
    </div>
  );
}

/** The address field with a live availability check, 400 ms after the last keystroke. */
function AddressStep({ prefix, error, head, onChange, onBack, onNext }: { prefix: string; error: string | null; head: React.ReactNode; onChange: (p: string) => void; onBack: React.ReactNode; onNext: () => void }) {
  const [check, setCheck] = useState<{ state: "idle" | "checking" | "ok" | "bad" | "failed"; text?: string; suggestion?: string | null }>({ state: "idle" });
  const problem = prefixProblem(prefix);

  useEffect(() => {
    if (problem) { setCheck({ state: prefix ? "bad" : "idle", text: prefix ? problem : undefined }); return; }
    setCheck({ state: "checking" });
    let current = true;
    const id = setTimeout(() => {
      call<Availability>(`address?prefix=${encodeURIComponent(prefix)}`).then(
        (a) => { if (current) setCheck(a.available ? { state: "ok" } : { state: "bad", text: a.reason ?? "That address is taken.", suggestion: a.suggestion }); },
        (e: Error) => { if (current) setCheck({ state: "failed", text: e.message }); },
      );
    }, 400);
    return () => { current = false; clearTimeout(id); };
  }, [prefix, problem]);

  const shown = error ?? (check.state === "bad" || check.state === "failed" ? check.text : null);
  return (
    <form className="od-auth od-reg__card" noValidate onSubmit={(e) => { e.preventDefault(); if (check.state === "ok") onNext(); }}>
      {head}
      <div className="od-field">
        <label htmlFor="prefix">Address</label>
        <div className="od-reg__addr">
          <input id="prefix" className="od-input" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={30} value={prefix} aria-describedby="prefix-status" aria-invalid={check.state === "bad"} onChange={(e) => onChange(e.target.value.toLowerCase())} />
          <span className="od-reg__suffix">.{DOMAIN}</span>
        </div>
        <span className="od-small">3–30 letters and numbers, starting with a letter.</span>
      </div>
      <div id="prefix-status" aria-live="polite" className="od-reg__status">
        {check.state === "checking" ? <span className="od-small">Checking…</span> : null}
        {check.state === "ok" ? <span className="od-reg__ok">✓ Available — {prefix}.{DOMAIN}</span> : null}
        {shown ? <span className="od-reg__err od-small" role={error ? "alert" : undefined}>✕ {shown}</span> : null}
        {check.state === "bad" && check.suggestion ? <button type="button" className="od-link od-reg__link" onClick={() => onChange(check.suggestion!)}>Use {check.suggestion}</button> : null}
      </div>
      <div className="od-reg__row">
        {onBack}
        <button className="od-btn od-btn--primary" type="submit" disabled={check.state !== "ok"}>Continue</button>
      </div>
    </form>
  );
}
