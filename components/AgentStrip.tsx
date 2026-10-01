"use client";

import { useEffect, useState } from "react";
import { agent } from "@/content/site";
import { Icon, Rich } from "./Icon";

/** Voice in on the left; five agent steps tick over on the right. Loops through the prompts. */
export function AgentStrip() {
  const [p, setP] = useState(0);
  const [typed, setTyped] = useState<string>(agent.prompts[0].text);
  const [step, setStep] = useState<number>(agent.steps.length); // all done until motion starts
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)));
    (async () => {
      await wait(1200);
      for (let k = 0; alive; k = (k + 1) % agent.prompts.length) {
        const text = agent.prompts[k].text;
        setP(k);
        setStep(0);
        setListening(true);
        for (let i = 1; i <= text.length && alive; i++) {
          setTyped(text.slice(0, i));
          await wait(42);
        }
        setListening(false);
        for (let s = 1; s <= agent.steps.length && alive; s++) {
          await wait(900);
          setStep(s);
        }
        await wait(4500);
      }
    })();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  const prompt = agent.prompts[p];
  const done = step >= agent.steps.length;
  return (
    <div className="od-wrap od-agent2" id="agent">
      {/* Section 1: what the captain says, and what the agent answers */}
      <section className="od-agent-card od-agent-card--voice" aria-label="Talk to the agent">
        <div className="od-agent-card__bar">
          <span className="od-agent-strip__id">
            <span className="od-brand__badge">O</span>OmniPulse agent
          </span>
          <span className="od-small">{agent.site}</span>
        </div>
        <span className="od-agent-card__k">1 · You say it</span>
        <div className="od-voice">
          <div className="od-voice__top">
            <span className="od-voice__who">{agent.speaker}</span>
            <span className="od-wave" aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => (
                <i key={i} />
              ))}
            </span>
          </div>
          <div className="od-voice__text">{typed}</div>
          <div className="od-voice__lang">{listening ? "listening…" : prompt.lang}</div>
        </div>
        <div className="od-agent-card__reply" style={{ opacity: step >= 2 || done ? 1 : 0.3 }}>
          <span className="od-maha__av" style={{ width: 32, height: 32, fontSize: 13, flex: "none" }}>O</span>
          <p>
            <Rich text={prompt.reply} />
          </p>
        </div>
      </section>

      {/* Section 2: the five steps the agent takes on its own */}
      <section className="od-agent-card od-agent-card--steps" aria-label="What the agent does">
        <div className="od-agent-card__bar">
          <span className="od-agent-card__k" style={{ margin: 0 }}>2 · The agent does it</span>
          <span className="od-agent-strip__state" aria-live="polite">
            <span className="od-live" />
            {done ? `Done · ${agent.steps.length} of ${agent.steps.length}` : `Working · ${step + 1} of ${agent.steps.length}`}
          </span>
        </div>
        <ol className="od-steps5">
          {agent.steps.map((s, i) => (
            <li key={s.label} className={i < step ? "is-done" : i === step ? "is-run" : "is-wait"}>
              <span className="od-steps5__disc">
                <Icon name={s.icon} />
              </span>
              <span className="od-steps5__k">{s.label}</span>
              <span className="od-steps5__d">{s.detail}</span>
              <span className="od-steps5__t">{s.time}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
