"use client";

import { useEffect } from "react";

/**
 * Scroll reveal for marketing sections: marks [data-reveal] and
 * [data-reveal-stagger] elements visible once, as they enter the viewport,
 * then marks them settled so hover transitions stop inheriting the entrance.
 */
export function RevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal],[data-reveal-stagger]"));
    const settle = (el: HTMLElement) => window.setTimeout(() => el.setAttribute("data-settled", ""), 900);
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => { el.setAttribute("data-visible", ""); el.setAttribute("data-settled", ""); });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.setAttribute("data-visible", "");
          settle(el);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
