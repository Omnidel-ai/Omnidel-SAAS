"use client";

import { useEffect, useRef, useState } from "react";
import { acharyas, mahacharya } from "@/content/site";
import { Icon } from "./Icon";
import { Reveal, Stagger, StaggerItem } from "./Motion";

type Msg = { from: "a" | "u"; text: string; typing?: boolean };

/**
 * MahAcharya Ji, the visitor's guide. Replies are scripted from content/site.ts;
 * to go live, replace `reply()` with a call to the app's MahAcharya assistant.
 */
function MahAcharyaChat() {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "a", text: mahacharya.greeting }]);
  const [asked, setAsked] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function reply(q: string): string {
    const hit = mahacharya.qa.find((x) => x.q.toLowerCase() === q.toLowerCase());
    return hit?.a ?? mahacharya.fallback;
  }

  function ask(q: string, idx?: number) {
    if (busy || !q.trim()) return;
    setBusy(true);
    if (idx !== undefined) setAsked((a) => [...a, idx]);
    setMsgs((m): Msg[] => [...m, { from: "u" as const, text: q }, { from: "a" as const, text: "", typing: true }].slice(-6));
    const answer = reply(q);
    timers.current.push(
      setTimeout(() => {
        let n = 0;
        const tick = () => {
          n += 3;
          setMsgs((m): Msg[] => [...m.slice(0, -1), { from: "a" as const, text: answer.slice(0, n) }]);
          if (n < answer.length) timers.current.push(setTimeout(tick, 18));
          else setBusy(false);
        };
        tick();
      }, 900),
    );
  }

  return (
    <div className="od-maha">
      <div className="od-maha__head">
        <span className="od-maha__av">
          M<span className="od-live" />
        </span>
        <div>
          <div className="od-maha__name">{mahacharya.name}</div>
          <div className="od-maha__role">{mahacharya.role}</div>
        </div>
      </div>
      <div className="od-maha__thread" aria-live="polite">
        {msgs.map((m, i) =>
          m.typing ? (
            <div key={i} className="od-msg od-msg--a od-msg--typing" aria-label="MahAcharya Ji is typing">
              <i />
              <i />
              <i />
            </div>
          ) : (
            <div key={i} className={`od-msg od-msg--${m.from}`}>
              {m.text}
            </div>
          ),
        )}
      </div>
      <div className="od-maha__foot">
        <div className="od-chips">
          {mahacharya.qa.map((x, i) => (
            <button key={x.q} type="button" disabled={asked.includes(i) || busy} onClick={() => ask(x.q, i)}>
              {x.q}
            </button>
          ))}
        </div>
        <form
          className="od-maha__input"
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
            setDraft("");
          }}
        >
          <input
            aria-label="Ask MahAcharya Ji"
            placeholder={mahacharya.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{ flex: 1, border: 0, background: "transparent", font: "inherit", color: "var(--ink)", outline: "none" }}
          />
          <button type="submit" className="od-maha__send" aria-label="Send" style={{ border: 0, cursor: "pointer" }}>
            <Icon name="send" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AcharyasSection() {
  return (
    <section className="od-section" id="acharyas">
      <div className="od-wrap od-acharyas">
        <div className="od-acharyas__roster">
          <span className="od-eyebrow" style={{ color: "var(--terracotta)", letterSpacing: ".2em" }}>
            Meet the Acharyas
          </span>
          <h2 className="od-display">
            A mentor for <em style={{ color: "var(--terracotta)" }}>every</em> worker
          </h2>
          <p className="od-lead">Nine AI Acharyas who score the work, teach in the worker’s language, and never lose patience.</p>
          <Stagger className="od-roster">
            {acharyas.map((a) => (
              <StaggerItem className="od-roster__p" key={a.name}>
                <span className="od-roster__av" style={{ background: a.color }}>
                  {a.initials}
                </span>
                <span className="od-roster__n">{a.name}</span>
                <span className="od-roster__k">{a.field}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <Reveal delay={0.1} distance={40}>
          <MahAcharyaChat />
        </Reveal>
      </div>
    </section>
  );
}
