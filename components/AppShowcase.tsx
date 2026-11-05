"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { showcase } from "@/content/site";
import { enterSpring } from "./Motion";

/**
 * "See it in the app": a short product tour. Each feature is a real screen
 * recording. The active tab's bar fills while its clip plays, then the tour
 * moves to the next feature; it only plays while it is on screen. With reduced
 * motion nothing plays by itself and each clip gets the browser's controls.
 */
export function AppShowcase() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const bars = useRef<(HTMLElement | null)[]>([]);
  const item = showcase[i];

  const go = (k: number) => setI((k + showcase.length) % showcase.length);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Set after mount (not as attributes) so the server HTML never disagrees with a reduced-motion visitor.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.controls = Boolean(reduce);
    if (onScreen && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [onScreen, reduce, i]);

  // The active tab's bar follows the clip frame by frame (set directly, no re-render).
  useEffect(() => {
    bars.current.forEach((b, k) => {
      if (b && k !== i) b.style.transform = "scaleX(0)";
    });
    let raf = 0;
    const tick = () => {
      const v = video.current;
      const b = bars.current[i];
      if (v && b && v.duration) b.style.transform = `scaleX(${Math.min(1, v.currentTime / v.duration)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [i]);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const k = (i + d + showcase.length) % showcase.length;
    go(k);
    document.getElementById(`od-tour-tab-${showcase[k].key}`)?.focus();
  }

  const clip = (
    <video
      ref={video}
      className="od-tour__video"
      muted
      playsInline
      preload="auto"
      poster={`${item.clip}.jpg`}
      onEnded={() => {
        if (!reduce) go(i + 1);
      }}
      aria-label={`Screen recording: ${item.title}`}
    >
      <source src={`${item.clip}.mp4`} type="video/mp4" />
      <source src={`${item.clip}.webm`} type="video/webm" />
    </video>
  );

  return (
    <div className="od-tour" ref={root}>
      <div className="od-tour__list" role="tablist" aria-label="What the app does" aria-orientation="vertical" onKeyDown={onKey}>
        {showcase.map((s, k) => (
          <button
            key={s.key}
            id={`od-tour-tab-${s.key}`}
            type="button"
            role="tab"
            aria-selected={k === i}
            aria-controls="od-tour-panel"
            tabIndex={k === i ? 0 : -1}
            className="od-tour__tab"
            onClick={() => go(k)}
          >
            <span className="od-tour__num">{String(k + 1).padStart(2, "0")}</span>
            <span className="od-tour__title">{s.title}</span>
            <span className="od-tour__more">
              <span>
                <span className="od-tour__text">{s.text}</span>
              </span>
            </span>
            <span className="od-tour__progress" aria-hidden="true">
              <i
                ref={(el) => {
                  bars.current[k] = el;
                }}
              />
            </span>
          </button>
        ))}
      </div>

      <div className="od-tour__stage" id="od-tour-panel" role="tabpanel" aria-labelledby={`od-tour-tab-${item.key}`}>
        <motion.div
          key={item.key}
          className={`od-tour__shot od-tour__shot--${item.kind}`}
          initial={{ opacity: 0, transform: reduce ? "none" : "translateY(10px) scale(0.985)" }}
          animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
          transition={reduce ? { duration: 0.2 } : enterSpring}
        >
          {item.kind === "desk" ? (
            <div className="od-tour__frame">
              <div className="od-tour__chrome">
                <i />
                <i />
                <i />
                <span className="od-tour__url">{item.url}</span>
              </div>
              {clip}
            </div>
          ) : (
            <div className="od-tour__phone">{clip}</div>
          )}
        </motion.div>
        <span className="od-tour__note">Recorded in the OmniDEL apps · demo data</span>
      </div>
    </div>
  );
}
