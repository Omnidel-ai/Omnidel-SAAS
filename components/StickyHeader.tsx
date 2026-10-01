"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * The header stays fixed at the top the whole time, scrolling down or up.
 * At the very top it sits clear over the hero; once the page has scrolled it
 * gets a frosted background so it stays readable over any section.
 */
export function StickyHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="od-nav-spacer">
      <header className="od-nav" data-scrolled={scrolled || undefined}>
        {children}
      </header>
    </div>
  );
}
