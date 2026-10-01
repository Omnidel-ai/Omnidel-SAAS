import Link from "next/link";
import { beforeAfter, brand, closing, faq, hero, trust } from "@/content/site";
import { Nav } from "./Chrome";
import { Icon } from "./Icon";
import { scene } from "@/lib/scenes";
import { HeroFade, Parallax, Reveal, Stagger, StaggerItem } from "./Motion";

export function Hero() {
  const bg = scene("hero");
  return (
    <section className="od-hero od-hero--calm">
      <div className={`od-scene-wrap${bg.photo ? " od-scene-wrap--photo" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Parallax style={{ position: "absolute", inset: 0 }} speed={0.35}>
          <img className="od-scene" src={bg.src} alt="" style={{ objectPosition: bg.photo ? "70% center" : "center" }} />
        </Parallax>
      </div>
      <Nav />
      <div className="od-wrap od-hero3">
        <HeroFade className="od-hero3__text">
          <span className="od-eyebrow">{hero.eyebrow}</span>
          <h1 className="od-display-xl">
            {hero.title[0]}
            <br />
            {hero.title[1]} <em>{hero.title[2]}</em>
          </h1>
          <p className="od-lead">{hero.lead}</p>
          <div className="od-hero3__ctas">
            <Link className="od-btn od-btn--ink" href={hero.primary.href}>
              {hero.primary.label}
            </Link>
            <a className="od-play" href={hero.video.href}>
              <span className="od-play__btn">
                <Icon name="play" />
              </span>
              <span>
                {hero.video.label}
                <small>{hero.video.note}</small>
              </span>
            </a>
          </div>
          <span className="od-hero3__note">
            <span className="od-live" />
            {hero.live}
          </span>
        </HeroFade>
        <span className="od-hero3__caption" lang="hi">
          काम से
          <br />
          कर्म तक
          <small style={{ display: "block", font: "12px/18px var(--font-sans)", color: "var(--ink-soft)" }}>{brand.motto.en}</small>
        </span>
      </div>
    </section>
  );
}

export function Trust() {
  return (
    <div className="od-wrap od-trust">
      <span className="od-eyebrow">{trust.title}</span>
      <Stagger className="od-trust__row">
        {trust.items.map((t) => (
          <StaggerItem key={t.name}>
            {t.name}
            <small>{t.note}</small>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

export function BeforeAfter() {
  const b = beforeAfter;
  return (
    <Stagger className="od-ba">
      <StaggerItem className="od-ba__card od-ba__card--before">
        <div>
          <span className="od-ba__tag">{b.before.tag}</span>
          <h3 className="od-ba__title">{b.before.title}</h3>
        </div>
        <ul className="od-ba__list">
          {b.rows.map((r) => (
            <li key={r.before}>
              <span className="od-ba__mark">✕</span>
              {r.before}
            </li>
          ))}
        </ul>
      </StaggerItem>
      <StaggerItem className="od-ba__arrow">
        <Icon name="arrow" />
      </StaggerItem>
      <StaggerItem className="od-ba__card od-ba__card--after">
        <div>
          <span className="od-ba__tag">{b.after.tag}</span>
          <h3 className="od-ba__title">{b.after.title}</h3>
        </div>
        <ul className="od-ba__list">
          {b.rows.map((r) => (
            <li key={r.after}>
              <span className="od-ba__mark">✓</span>
              {r.after}
            </li>
          ))}
        </ul>
      </StaggerItem>
    </Stagger>
  );
}

export function Faq() {
  return (
    <Reveal className="od-faq">
      {faq.map((f, i) => (
        <details key={f.q} open={i === 0}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </Reveal>
  );
}

export function Closing() {
  const bg = scene("closing");
  return (
    <section className="od-closing">
      <div className={`od-scene-wrap${bg.photo ? " od-scene-wrap--photo od-scene-wrap--photo-r" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Parallax style={{ position: "absolute", inset: 0 }} speed={0.25}>
          <img className="od-scene" src={bg.src} alt="" style={{ objectPosition: bg.photo ? "center" : "left bottom" }} />
        </Parallax>
      </div>
      <div className="od-wrap">
        <Reveal className="od-closing__text">
          <span className="od-indic" lang="hi">
            {brand.motto.hi}
          </span>
          <h2 className="od-display">
            {closing.title[0]}
            <br />
            {closing.title[1]}
          </h2>
          <p className="od-lead">{closing.lead}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="od-btn od-btn--ink" href="/pricing">
              Try the agent →
            </Link>
            <Link className="od-btn od-btn--secondary" href="/pricing">
              See plans &amp; pricing
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
