"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { acharyaPage, acharyas } from "@/content/site";
import { Icon } from "./Icon";
import { enterSpring, Reveal, Stagger, StaggerItem } from "./Motion";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* ── Hero ──────────────────────────────────────────────────────────────── */

export function AcharyaHero() {
  const p = acharyaPage;
  const reduce = useReducedMotion();
  return (
    <div className="od-wrap od-ahero">
      <motion.div
        className="od-ahero__hello"
        initial={{ opacity: 0, transform: reduce ? "none" : "translateY(24px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{ ...enterSpring, delay: 0.05 }}
      >
        <span className="od-ahero__hi">{p.hello}</span>
        <h1 className="od-display-xl">{p.name}</h1>
        <p className="od-lead">{p.lead}</p>
        <div className="od-ahero__ctas">
          <a className="od-btn od-btn--ink" href="#listen">
            <Icon name="play" size={14} /> Hear Acharya Ji
          </a>
          <a className="od-btn od-btn--secondary" href={p.cta.href}>
            {p.cta.label}
          </a>
        </div>
      </motion.div>
      <motion.div
        className="od-ahero__portrait"
        initial={{ opacity: 0, transform: reduce ? "none" : "translateY(40px) scale(0.97)" }}
        animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
        transition={{ ...enterSpring, duration: 0.9 }}
      >
        {p.portrait ? (
          <div className="od-ahero__photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.portrait} alt="MahAcharya Ji" width={2740} height={1536} />
          </div>
        ) : (
          <div className="od-ahero__mono" aria-label="MahAcharya Ji">
            <span>M</span>
            <small>MahAcharya Ji</small>
          </div>
        )}
        <span className="od-ahero__badge">
          <span className="od-live" /> Online now
        </span>
      </motion.div>
      <motion.p
        className="od-ahero__role"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {p.role}
      </motion.p>
    </div>
  );
}

/* ── Listen to Acharya Ji ──────────────────────────────────────────────── */

type Clip = (typeof acharyaPage.listen.clips)[number];

export function ListenSection() {
  const { listen } = acharyaPage;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const audio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setTime(0);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  function play(i: number) {
    const a = audio.current;
    if (!a) return;
    if (i === active && playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    if (i !== active) {
      a.src = listen.clips[i].src;
      setActive(i);
      setTime(0);
    }
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function seek(e: React.MouseEvent<HTMLDivElement>, clip: Clip) {
    const a = audio.current;
    if (!a) return;
    const r = e.currentTarget.getBoundingClientRect();
    const t = ((e.clientX - r.left) / r.width) * (a.duration || clip.duration);
    a.currentTime = t;
    setTime(t);
  }

  return (
    <section className="od-section od-section--band od-listen" id="listen">
      <div className="od-wrap od-listen__grid">
        <Reveal className="od-listen__intro">
          <h2 className="od-display">
            {listen.title[0]}
            <br />
            <em>{listen.title[1]}</em>
          </h2>
          <p className="od-body">{listen.lead}</p>
        </Reveal>
        <div className="od-listen__cards">
          {listen.clips.map((c, i) => {
            const open = i === active;
            const progress = open ? Math.min(1, time / c.duration) : 0;
            return (
              <div
                key={c.src}
                className={`od-clip${open ? " od-clip--open" : ""}`}
                onClick={() => !open && play(i)}
              >
                <span className="od-clip__num" aria-hidden="true">
                  {i + 1}
                </span>
                {open ? (
                  <div className="od-clip__body">
                    <span className="od-clip__lang">{c.lang}</span>
                    <h3 className="od-h3">{c.title}</h3>
                    <p className="od-small">{c.note}</p>
                    <div className="od-clip__player">
                      <button type="button" className="od-clip__play" aria-label={playing ? `Pause ${c.title}` : `Play ${c.title}`} onClick={(e) => { e.stopPropagation(); play(i); }}>
                        {playing ? <span className="od-clip__pause" /> : <Icon name="play" />}
                      </button>
                      <div className="od-wave" onClick={(e) => seek(e, c)} role="slider" aria-label="Seek" aria-valuemin={0} aria-valuemax={c.duration} aria-valuenow={Math.round(time)} tabIndex={0}>
                        {c.peaks.map((h, k) => (
                          <i key={k} style={{ height: `${Math.round(h * 100)}%` }} data-on={k / c.peaks.length < progress || undefined} />
                        ))}
                      </div>
                      <span className="od-clip__time">{fmt(open && time ? time : c.duration)}</span>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="od-clip__play od-clip__play--ghost" aria-label={`Play ${c.title}`} onClick={(e) => { e.stopPropagation(); play(i); }}>
                    <Icon name="play" />
                  </button>
                )}
              </div>
            );
          })}
          <div className="od-clip od-clip--soon" aria-label="More clips coming soon">
            <span className="od-clip__num" aria-hidden="true">{listen.clips.length + 1}</span>
            <span className="od-clip__soon">Soon</span>
          </div>
        </div>
        <audio ref={audio} src={listen.clips[0].src} preload="metadata" />
      </div>
    </section>
  );
}

/* ── What Acharya Ji can do (sticky side menu + mock cards) ────────────── */

type Cap = (typeof acharyaPage.capabilities.items)[number];

function CapMock({ cap }: { cap: Cap }) {
  if ("langs" in cap && cap.langs) {
    return (
      <Stagger className="od-langs">
        {cap.langs.map((l) => (
          <StaggerItem key={l} className="od-langs__chip">
            {l}
          </StaggerItem>
        ))}
      </Stagger>
    );
  }
  if (!("mock" in cap) || !cap.mock) return null;
  const m = cap.mock;
  return (
    <div className="od-mock">
      <div className="od-mock__head">
        <b>{m.head}</b>
        <span>{m.meta}</span>
      </div>
      {m.rows.map((r, i) => (
        <div className="od-mock__row" key={i}>
          <span className="od-mock__tag">{r.tag}</span>
          <span className="od-mock__text">{r.text}</span>
          {r.status ? <span className={`od-pill od-pill--${r.tone || "mute"}`}>{r.status}</span> : <span />}
        </div>
      ))}
    </div>
  );
}

export function CapabilitiesSection() {
  const { capabilities } = acharyaPage;
  const [current, setCurrent] = useState<string>(capabilities.items[0].key);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setCurrent(hit.target.id.replace("cap-", ""));
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    Object.values(refs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="od-section" id="abilities">
      <div className="od-wrap">
        <Reveal className="od-head">
          <span className="od-eyebrow">{capabilities.eyebrow}</span>
          <h2 className="od-display">{capabilities.title}</h2>
        </Reveal>
        <div className="od-caps">
          <nav className="od-caps__nav" aria-label="Abilities">
            {capabilities.items.map((c) => (
              <a key={c.key} href={`#cap-${c.key}`} aria-current={c.key === current ? "true" : undefined}>
                {c.nav}
              </a>
            ))}
          </nav>
          <div className="od-caps__list">
            {capabilities.items.map((c) => (
              <article key={c.key} id={`cap-${c.key}`} className="od-cap" ref={(el) => { refs.current[c.key] = el; }}>
                <Reveal>
                  <h3 className="od-display od-cap__title">
                    {c.title[0]} <em>{c.title[1]}</em>
                  </h3>
                  <p className="od-lead">{c.lead}</p>
                </Reveal>
                <Reveal delay={0.08} distance={36} className="od-cap__stage">
                  <CapMock cap={c} />
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── App screens ───────────────────────────────────────────────────────── */

export function AcharyaScreens() {
  const s = acharyaPage.screens;
  return (
    <section className="od-section od-section--band">
      <div className="od-wrap">
        <Reveal className="od-head">
          <span className="od-eyebrow">{s.eyebrow}</span>
          <h2 className="od-display">{s.title}</h2>
          <p className="od-lead">{s.lead}</p>
        </Reveal>
        <Stagger className="od-phones">
          {s.phones.map((ph) => (
            <StaggerItem key={ph.image}>
              <figure className="od-phone">
                <div className="od-phone__body">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph.image} alt={`Acharya app: ${ph.label}`} width={804} height={1740} loading="lazy" />
                </div>
                <figcaption>{ph.label}</figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
        <span className="od-shotnote" style={{ display: "block", textAlign: "center", marginTop: 20 }}>
          Real Acharya app screens · demo data
        </span>
      </div>
    </section>
  );
}

/* ── Meet other Acharyas (hover to say hello) ──────────────────────────── */

export function OtherAcharyas() {
  const o = acharyaPage.others;
  const list = acharyas.filter((a) => a.name !== "MahAcharya Ji");
  return (
    <section className="od-section" id="meet">
      <div className="od-wrap">
        <Reveal className="od-head">
          <span className="od-eyebrow">{o.eyebrow}</span>
          <h2 className="od-display">{o.title}</h2>
          <p className="od-lead">{o.lead}</p>
        </Reveal>
        <Stagger className="od-meet">
          {list.map((a) => (
            <StaggerItem key={a.name}>
              <div className="od-meet__card" tabIndex={0} style={{ "--tone": a.color } as React.CSSProperties}>
                <span className="od-meet__av">
                  {a.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.photo} alt="" width={240} height={240} loading="lazy" />
                  ) : (
                    a.initials
                  )}
                </span>
                <span className="od-meet__name">{a.name} Acharya</span>
                <span className="od-meet__field">{a.field}</span>
                <span className="od-meet__hello">
                  “Hello, I am {a.name} Acharya.”
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="od-center" delay={0.1}>
          <Link className="od-btn od-btn--ink" href="/pricing" style={{ marginTop: 48 }}>
            Bring an Acharya to your crew <Icon name="arrow" size={16} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
