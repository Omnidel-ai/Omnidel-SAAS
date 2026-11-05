"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** The phone menu: below 860px the header's links fold into this button. */
export function NavMenu({ links, demo }: { links: readonly { label: string; href: string }[]; demo: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  return (
    <div className="od-menu" data-open={open || undefined}>
      <button
        type="button"
        className="od-menu__btn"
        aria-expanded={open}
        aria-controls="od-menu-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
      </button>
      <div className="od-menu__panel" id="od-menu-panel" hidden={!open}>
        <nav aria-label="Menu">
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
        <a className="od-btn od-btn--secondary od-btn--block" href={demo}>
          Book a demo
        </a>
      </div>
    </div>
  );
}
