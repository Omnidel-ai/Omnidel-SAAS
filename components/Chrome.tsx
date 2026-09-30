import Link from "next/link";
import { brand, footer, nav } from "@/content/site";

export function Brand() {
  return (
    <Link className="od-brand" href="/" aria-label={`${brand.name} home`}>
      <span className="od-brand__badge">{brand.badge}</span>
      <span className="od-brand__name">{brand.name}</span>
    </Link>
  );
}

export function Nav({ current }: { current?: string }) {
  return (
    <header className="od-nav">
      <div className="od-wrap od-nav__bar">
        <Brand />
        <nav className="od-nav__links" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.label} href={n.href} aria-current={n.label === current ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="od-nav__actions">
          <Link className="od-btn od-btn--ink od-btn--sm" href="/login">
            Log in
          </Link>
          <a className="od-btn od-btn--secondary od-btn--sm" href="mailto:ram.badrinathan@jvl.run?subject=OmniPulse%20demo">
            Book a demo
          </a>
        </div>
      </div>
    </header>
  );
}

const LEGAL: Record<string, string> = {
  "Privacy policy": "https://omnidel.ai/privacy-policy",
  "Terms of use": "https://omnidel.ai/terms-of-use",
  Disclaimer: "https://omnidel.ai/disclaimer",
};

export function Footer() {
  return (
    <footer className="od-footer" style={{ marginTop: 0 }}>
      <div className="od-wrap">
        <div className="od-footer__grid">
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Brand />
            <p className="od-small" style={{ maxWidth: 300 }}>
              {brand.tagline}
            </p>
          </div>
          {footer.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>{LEGAL[l] ? <a href={LEGAL[l]}>{l}</a> : l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="od-footer__legal">
          <span>{brand.legal}</span>
          <span>{brand.trademark}</span>
        </div>
      </div>
    </footer>
  );
}

export function SectionHead({ eyebrow, title, lead }: { eyebrow: string; title: React.ReactNode; lead?: string }) {
  return (
    <div className="od-head" data-reveal>
      <span className="od-eyebrow">{eyebrow}</span>
      <h2 className="od-display">{title}</h2>
      {lead ? <p className="od-lead">{lead}</p> : null}
    </div>
  );
}

export function AskPill() {
  return (
    <a className="od-ask" href="/#acharyas" style={{ position: "fixed" }}>
      <span className="od-brand__badge">M</span>
      <span>
        Ask MahAcharya Ji<small>“How will an Acharya help my crew?”</small>
      </span>
    </a>
  );
}
