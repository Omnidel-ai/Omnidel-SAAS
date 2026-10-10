"use client";

/**
 * Spring-based scroll motion, built on Motion (the library formerly called
 * Framer Motion). Everything here is marketing-page motion: it fires once as a
 * section scrolls in, or follows the scroll position through a spring so it
 * never feels mechanical.
 *
 * Rules followed (Emil Kowalski's animation standards):
 * - animate the full `transform` string, not the x / y / scale shorthands,
 *   so it stays hardware-accelerated;
 * - never scale from 0, never ease-in;
 * - springs with a gentle bounce (0.1–0.2), no bounce on scroll-linked values;
 * - reduced motion keeps the fade and drops every movement.
 */

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue, type Variants } from "motion/react";
import { useRef, type ReactNode } from "react";

/** The one entrance spring used across the site. */
export const enterSpring = { type: "spring", duration: 0.7, bounce: 0.18 } as const;
/** Smoothing for scroll-linked values: follows the scroll without bouncing. */
const scrollSpring = { stiffness: 120, damping: 30, mass: 0.4, restDelta: 0.001 };

const viewport = { once: true, margin: "0px 0px -80px 0px" } as const;

/** A block that rises into place on a spring the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0, distance = 28 }: { children: ReactNode; className?: string; delay?: number; distance?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, transform: reduce ? "none" : `translateY(${distance}px)` }}
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={viewport}
      transition={reduce ? { duration: 0.2 } : { ...enterSpring, delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** A grid or list whose children rise in one after another (use StaggerItem for each child). */
export function Stagger({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div className={className} style={style} variants={staggerParent} initial="hidden" whileInView="shown" viewport={viewport}>
      {children}
    </motion.div>
  );
}

export function useItemVariants(distance = 24): Variants {
  const reduce = useReducedMotion();
  return {
    hidden: { opacity: 0, transform: reduce ? "none" : `translateY(${distance}px) scale(0.98)` },
    shown: { opacity: 1, transform: "translateY(0px) scale(1)", transition: reduce ? { duration: 0.2 } : enterSpring },
  };
}

export function StaggerItem({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  const variants = useItemVariants();
  return (
    <motion.div className={className} style={style} variants={variants}>
      {children}
    </motion.div>
  );
}

/** A thin reading-progress bar at the top of the page, smoothed by a spring. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, scrollSpring);
  return <motion.div className="od-progress" style={{ scaleX }} aria-hidden="true" />;
}

/**
 * Parallax for the painted scenes: the layer drifts slower than the page,
 * through a spring, so it feels like distance rather than a glued-on image.
 */
export function Parallax({ children, className, style, speed = 0.25 }: { children: ReactNode; className?: string; style?: React.CSSProperties; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [-120 * speed, 120 * speed]);
  const y = useSpring(raw, scrollSpring);
  const transform = useTransform(y, (v: number) => (reduce ? "none" : `translateY(${v}px) scale(1.06)`));
  return (
    <motion.div ref={ref} className={className} style={{ ...style, transform }}>
      {children}
    </motion.div>
  );
}

/** The hero text eases up and fades a little as you scroll away from it. */
export function HeroFade({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, scrollSpring);
  const opacity = useTransform(smooth, [0, 520], [1, reduce ? 1 : 0.35]);
  const transform = useTransform(smooth, (v: number) => (reduce ? "none" : `translateY(${Math.min(v, 520) * -0.12}px)`));
  return (
    <motion.div className={className} style={{ opacity, transform }}>
      {children}
    </motion.div>
  );
}

/** The app screenshot frame straightens and grows into place as it scrolls up to the middle of the screen. */
export function ScrollZoom({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const p = useSpring(scrollYProgress, scrollSpring);
  const transform = useTransform(p as MotionValue<number>, (v: number) =>
    reduce ? "none" : `perspective(1400px) rotateX(${(1 - v) * 10}deg) scale(${0.92 + v * 0.08}) translateY(${(1 - v) * 40}px)`,
  );
  const opacity = useTransform(p, [0, 0.4, 1], [0.4, 0.85, 1]);
  return (
    <motion.div ref={ref} className={className} style={{ transform, opacity, transformOrigin: "50% 0%" }}>
      {children}
    </motion.div>
  );
}
