"use client";

import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { heroChat, journey, numbers } from "@/content/site";
import { enterSpring, Reveal, Stagger, StaggerItem } from "./Motion";

/* ── Hero chat: bubbles appear one by one, scenes cycle ─────────────────── */

export function HeroChat() {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [paused, setPaused] = useState(false);
  const s = heroChat.scenes[scene];

  useEffect(() => {
    if (paused) return;
    let t: ReturnType<typeof setTimeout>;
    if (shown < s.msgs.length) {
      const next = s.msgs[shown];
      if (next.from === "a" && !typing) {
        t = setTimeout(() => setTyping(true), 500);
      } else {
        t = setTimeout(() => {
          setTyping(false);
          setShown((n) => n + 1);
        }, next.from === "a" ? 1300 : shown === 0 ? 500 : 1100);
      }
    } else {
      t = setTimeout(() => go(1), 4200);
    }
    return () => clearTimeout(t);
  }, [shown, typing, paused, scene]); // eslint-disable-line react-hooks/exhaustive-deps

  function go(d: number) {
    setScene((i) => (i + d + heroChat.scenes.length) % heroChat.scenes.length);
    setShown(0);
    setTyping(false);
  }

  const visible = reduce ? s.msgs : s.msgs.slice(0, shown);

  return (
    <div className="od-hchat" aria-label="Example conversations with an Acharya">
      <div className="od-hchat__top">
        <span className="od-hchat__topic">{s.topic}</span>
        <span className="od-hchat__lang">{s.lang}</span>
      </div>
      <div className="od-hchat__thread" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((m, i) => (
            <motion.div
              key={`${scene}-${i}`}
              layout
              initial={{ opacity: 0, transform: "translateY(10px) scale(0.98)" }}
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={enterSpring}
              className={`od-hchat__row od-hchat__row--${m.from}`}
            >
              {m.from === "a" ? <span className="od-hchat__av" aria-hidden="true">M</span> : null}
              <span className="od-hchat__bubble">{m.text}</span>
            </motion.div>
          ))}
          {typing && !reduce ? (
            <motion.div key={`${scene}-typing`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="od-hchat__row od-hchat__row--a">
              <span className="od-hchat__av" aria-hidden="true">M</span>
              <span className="od-hchat__bubble od-hchat__typing" aria-label={`${heroChat.acharya} is typing`}>
                <i />
                <i />
                <i />
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="od-hchat__ctrl">
        <button type="button" onClick={() => go(-1)} aria-label="Previous conversation">
          ‹
        </button>
        <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play conversations" : "Pause conversations"}>
          {paused ? "▶" : "❚❚"}
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next conversation">
          ›
        </button>
        <span className="od-hchat__dots" aria-hidden="true">
          {heroChat.scenes.map((x, i) => (
            <i key={x.topic} data-on={i === scene || undefined} />
          ))}
        </span>
      </div>
    </div>
  );
}

/* ── From sign-up to a working crew ──────────────────────────────────────── */

export function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const width = useTransform(p, (v: number) => `${reduce ? 100 : Math.max(0, Math.min(1, v)) * 100}%`);

  return (
    <section className="od-section" id="journey">
      <div className="od-wrap">
        <Reveal className="od-journey__head">
          <span className="od-eyebrow">{journey.eyebrow}</span>
          <h2 className="od-display">
            {journey.title[0]}
            <br />
            <em>{journey.title[1]}</em>
          </h2>
          <p className="od-lead">{journey.lead}</p>
        </Reveal>
        <div className="od-journey" ref={ref}>
          <div className="od-journey__track" aria-hidden="true">
            <motion.span className="od-journey__fill" style={{ width }} />
          </div>
          <Stagger className="od-journey__steps">
            {journey.steps.map((s, i) => (
              <StaggerItem key={s.title} className="od-journey__step">
                <span className="od-journey__label">{s.label}</span>
                <span className="od-journey__num">{i + 1}</span>
                <h3 className="od-h3">{s.title}</h3>
                <p className="od-small">{s.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ── Numbers (count up when they scroll in) ─────────────────────────────── */

function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setN(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 1100);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to]);
  return <span ref={ref}>{n}</span>;
}

export function Numbers() {
  return (
    <section className="od-section od-section--band" id="numbers">
      <div className="od-wrap">
        <Reveal className="od-head">
          <h2 className="od-display">
            {numbers.title[0]} <em>{numbers.title[1]}</em>
          </h2>
        </Reveal>
        <div className="od-nums">
          <Stagger className="od-nums__row">
            {numbers.items.map((it) => (
              <StaggerItem key={it.label} className={`od-nums__card${"featured" in it && it.featured ? " od-nums__card--up" : ""}`}>
                <div className="od-nums__value">
                  {it.pre}
                  <CountUp to={it.value} />
                  <span className="od-nums__suffix">{it.suffix}</span>
                </div>
                <div className="od-nums__label">{it.label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <p className="od-nums__note">{numbers.note}</p>
      </div>
    </section>
  );
}
