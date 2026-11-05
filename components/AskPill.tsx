"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Floating "Ask MahAcharya Ji" dock. It stays hidden over the hero, then slides
 * in as a small portrait once the visitor scrolls on. The first time it appears
 * it shows its label for a few seconds, then folds back so it never sits on top
 * of the page; hovering or focusing it opens the label again.
 */
export function AskPill() {
  const [shown, setShown] = useState(false);
  const [peek, setPeek] = useState(false);
  const peeked = useRef(false);

  useEffect(() => {
    const check = () => setShown(window.scrollY > window.innerHeight * 0.6);
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    if (!shown || peeked.current) return;
    peeked.current = true;
    setPeek(true);
    const t = setTimeout(() => setPeek(false), 3800);
    return () => clearTimeout(t);
  }, [shown]);

  return (
    <a
      className="od-ask"
      href="/#acharyas"
      data-shown={shown || undefined}
      data-peek={(shown && peek) || undefined}
      aria-hidden={!shown}
      aria-label="Ask MahAcharya Ji: how will an Acharya help my crew?"
      tabIndex={shown ? undefined : -1}
    >
      <span className="od-ask__av">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/acharyas/mahacharya-avatar.webp" alt="" width={44} height={44} />
      </span>
      <span className="od-ask__label">
        Ask MahAcharya Ji<small>“How will an Acharya help my crew?”</small>
      </span>
    </a>
  );
}
