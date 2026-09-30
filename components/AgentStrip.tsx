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
    <div className="od-wrap" id="agent">
      <div className="od-agent-strip">
        <div className="od-agent-strip__bar">
          <span className="od-agent-strip__id">
            <span className="od-brand__badge">O</span>OmniPulse agent <span className="od-small">· {agent.site}</span>
          </span>
          <span className="od-agent-strip__state" aria-live="polite">
            <span className="od-live" />
            {done ? `Done · ${agent.steps.length} of ${agent.steps.length}` : `Working · ${step + 1} of ${agent.steps.length}`}
          </span>
        </div>
        <div className="od-agent-strip__body">
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
            <div className="od-voice__reply" style={{ opacity: step >= 2 || done ? 1 : 0.25 }}>
              <Rich text={prompt.reply} />
            </div>
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
        </div>
      </div>
    </div>
  );
}
