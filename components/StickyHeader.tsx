"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Keeps the header reachable: it hides while you scroll down to read, comes
 * back as soon as you scroll up, and is always shown at the very top.
 * Once the page has scrolled, it gets a frosted background so it stays legible.
 */
export function StickyHeader({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last.current;
        setScrolled(y > 8);
        if (y < 120) setHidden(false);
        else if (delta > 6) setHidden(true);
        else if (delta < -6) setHidden(false);
        last.current = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="od-nav-spacer">
      <header className="od-nav" data-hidden={hidden || undefined} data-scrolled={scrolled || undefined}>
        {children}
      </header>
    </div>
  );
}
