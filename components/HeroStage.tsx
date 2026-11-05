"use client";

import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { heroStage } from "@/content/site";
import { enterSpring } from "./Motion";

/** Pointer tilt follows the mouse loosely; scroll straightens the stage without bounce. */
const tiltSpring = { stiffness: 60, damping: 18, mass: 0.8 };
const scrollSpring = { stiffness: 120, damping: 30, mass: 0.4, restDelta: 0.001 };

const segments = heroStage.desk.segments;
type Segment = (typeof segments)[number];

/** A muted product clip that loops, and only plays while it is on screen. */
function Clip({ src, poster, label, onTime }: { src: string; poster: string; label: string; onTime?: (t: number) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduce) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.1 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <video
      ref={ref}
      className="od-stage__video"
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-label={label}
      onTimeUpdate={onTime ? (e) => onTime(e.currentTarget.currentTime) : undefined}
    >
      <source src={`${src}.mp4`} type="video/mp4" />
      <source src={`${src}.webm`} type="video/webm" />
    </video>
  );
}

/**
 * The hero's 3D stage: the OmniPulse web app in a browser window, the Acharya
 * app on a phone in front of it, and one toast floating nearer still with the
 * result of what the desktop clip is showing. The scene leans back, tilts
 * toward the pointer and straightens as the visitor scrolls into it.
 */
export function HeroStage() {
  const reduce = useReducedMotion();
  const [seg, setSeg] = useState<Segment>(segments[0]);

  // Pointer position over the window, -1..1 on each axis.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, tiltSpring);
  const sy = useSpring(my, tiltSpring);

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        mx.set((e.clientX / window.innerWidth) * 2 - 1);
        my.set((e.clientY / window.innerHeight) * 2 - 1);
      });
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce, mx, my]);

  // 0 at the top of the page, 1 once the stage has been scrolled into.
  const { scrollY } = useScroll();
  const sp = useSpring(useTransform(scrollY, [0, 520], [0, 1], { clamp: true }), scrollSpring);

  const transform = useTransform([sp, sx, sy], ([p, x, y]: number[]) =>
    reduce ? "rotateX(6deg)" : `rotateX(${(1 - p) * 14 - y * 2.5}deg) rotateY(${x * 5}deg) scale(${0.95 + p * 0.05})`,
  );
  // A soft highlight on the glass that slides opposite to the tilt, like light on a screen.
  const gx = useTransform(sx, (v: number) => `${50 - v * 35}%`);
  const gy = useTransform(sy, (v: number) => `${20 - v * 25}%`);
  const glare = useMotionTemplate`radial-gradient(70% 60% at ${gx} ${gy}, rgba(255, 253, 248, 0.3), rgba(255, 253, 248, 0) 62%)`;

  const onDeskTime = (t: number) => {
    let cur: Segment = segments[0];
    for (const s of segments) if (t >= s.at) cur = s;
    if (cur !== seg) setSeg(cur);
  };

  const toast = seg.toast;

  return (
    <motion.div
      className="od-stage"
      initial={{ opacity: 0, transform: reduce ? "none" : "translateY(56px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={reduce ? { duration: 0.2 } : { ...enterSpring, duration: 1.1, delay: 0.2 }}
    >
      <motion.div className="od-stage__scene" style={{ transform }}>
        <div className="od-stage__desk">
          <div className="od-stage__bar">
            <i />
            <i />
            <i />
            <span className="od-stage__url">app.omnidel.ai/{seg.path}</span>
            <span className="od-stage__now" key={seg.label}>
              <span className="od-live" />
              {seg.label}
            </span>
          </div>
          <div className="od-stage__screen">
            <Clip src={heroStage.desk.src} poster={heroStage.desk.poster} label={heroStage.desk.label} onTime={onDeskTime} />
            <motion.span className="od-stage__glare" style={{ backgroundImage: glare }} aria-hidden="true" />
          </div>
        </div>

        <div className="od-stage__phone">
          <div className="od-stage__phone-body">
            <Clip src={heroStage.phone.src} poster={heroStage.phone.poster} label={heroStage.phone.label} />
          </div>
        </div>

        <div className="od-stage__toast" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={toast.title}
              className="od-stage__toast-in"
              initial={{ opacity: 0, transform: reduce ? "none" : "translateY(12px) scale(0.97)" }}
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={{ opacity: 0, transform: reduce ? "none" : "translateY(-8px) scale(0.98)", transition: { duration: 0.18 } }}
              transition={reduce ? { duration: 0.2 } : enterSpring}
            >
              <span className={`od-stage__ico od-stage__ico--${toast.tone}`} aria-hidden="true">
                {toast.icon}
              </span>
              <span>
                <b>{toast.title}</b>
                <small>{toast.text}</small>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      <p className="od-stage__note">{heroStage.note}</p>
    </motion.div>
  );
}
