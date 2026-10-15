"use client";

import { useEffect, useState } from "react";

/**
 * Floating "Ask MahAcharya Ji" pill. It stays hidden over the hero, where it
 * would cover the hero chat, and slides in once the visitor scrolls on.
 */
export function AskPill() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const check = () => setShown(window.scrollY > window.innerHeight * 0.5);
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <a className="od-ask" href="/#acharyas" style={{ position: "fixed" }} data-shown={shown || undefined} aria-hidden={!shown} tabIndex={shown ? undefined : -1}>
      <span className="od-brand__badge">M</span>
      <span>
        Ask MahAcharya Ji<small>“How will an Acharya help my crew?”</small>
      </span>
    </a>
  );
}
