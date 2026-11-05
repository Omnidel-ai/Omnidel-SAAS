"use client";

import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { journey, numbers } from "@/content/site";
import { Reveal, Stagger, StaggerItem } from "./Motion";

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
