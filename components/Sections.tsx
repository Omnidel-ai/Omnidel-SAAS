import Link from "next/link";
import { beforeAfter, brand, closing, faq, hero } from "@/content/site";
import { Nav } from "./Chrome";
import { Icon } from "./Icon";
import { scene } from "@/lib/scenes";
import { HeroFade, Parallax, Reveal, Stagger, StaggerItem } from "./Motion";
import { HeroWorld } from "./HeroWorld";

export function Hero() {
  return (
    <section className="od-hero od-h5">
      <span className="od-h5__glow" aria-hidden="true" />
      <Nav />
      <div className="od-wrap od-h5__inner">
        <HeroFade className="od-h5__copy">
          <a className="od-h5__badge" href={hero.video.href}>
            <span className="od-live" />
            {hero.live}
            <span className="od-h5__badge-cta">{hero.video.label} →</span>
          </a>
          <h1 className="od-display-xl">
            <span className="od-h5__line">{hero.title[0]}</span>{" "}
            <span className="od-h5__line">
              {hero.title[1]} <em>{hero.title[2]}</em>
            </span>
          </h1>
          <p className="od-lead">{hero.lead}</p>
          <div className="od-h5__ctas">
            <Link className="od-btn od-btn--ink" href={hero.primary.href}>
              {hero.primary.label}
            </Link>
            <a className="od-btn od-btn--secondary" href={hero.video.href}>
              <Icon name="play" />
              {hero.video.label}
            </a>
          </div>
        </HeroFade>
        <HeroWorld />
      </div>
    </section>
  );
}

export { Trust } from "./Trust";

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
