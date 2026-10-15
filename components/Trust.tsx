"use client";

import { useInView, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef } from "react";
import { trust } from "@/content/site";
import { Stagger, StaggerItem } from "./Motion";

/**
 * Text whose whole numbers count up from 0 the first time it scrolls into view
 * ("30 workers onboarded" → 0 … 30). The server renders the real numbers, so
 * search engines and no-JS visitors always see the final text.
 */
function CountText({ text, delay = 0 }: { text: string; delay?: number }) {
  const parts = text.split(/(\d+)/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !inView || !ref.current) return;
    const nums = Array.from(ref.current.querySelectorAll<HTMLElement>("[data-n]"));
    nums.forEach((el) => (el.textContent = "0"));
    const ms = 1400;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      start ||= now + delay * 1000;
      const t = Math.min(1, Math.max(0, (now - start) / ms));
      nums.forEach((el) => (el.textContent = String(Math.round(Number(el.dataset.n) * easeOut(t)))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      nums.forEach((el) => (el.textContent = el.dataset.n ?? ""));
    };
  }, [inView, reduce, delay]);

  return (
    <span ref={ref}>
      {parts.map((p, i) =>
        /^\d+$/.test(p) ? (
          <span key={i} data-n={p} className="od-count">
            {p}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </span>
  );
}

/** "Backed by…" strip: cards rise in, a light sweeps across once, numbers count up, the live pilot pulses. */
export function Trust() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="od-wrap od-trust" data-seen={seen || undefined}>
      <span className="od-eyebrow">
        <CountText text={trust.title} />
      </span>
      <Stagger className="od-trust__row">
        {trust.items.map((t, i) => {
          const live = t.name.startsWith("Live");
          return (
            <StaggerItem key={t.name} className={live ? "od-trust__item od-trust__item--live" : "od-trust__item"}>
              <strong>
                {live && (
                  <span className="od-trust__pulse" aria-hidden="true">
                    <span className="od-live" />
                  </span>
                )}
                <span className="od-trust__name">{t.name}</span>
              </strong>
              <small>
                <CountText text={t.note} delay={0.35 + i * 0.07} />
              </small>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
