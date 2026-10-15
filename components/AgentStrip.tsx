"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { agent } from "@/content/site";
import { Icon, Rich } from "./Icon";

type Phase = "listen" | "work" | "done";

const TYPE_MS = 32; // per character of the voice transcript
const STEP_RUN_MS = 750; // a step shows as running for this long…
const STEP_GAP_MS = 220; // …then a short beat before the next one starts
const HOLD_MS = 5200; // finished run stays on screen before the next one

/** End offsets of each user-perceived character, so Bengali and Devanagari never show half a letter. */
function graphemeEnds(text: string): number[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const ends: number[] = [];
    for (const g of new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)) ends.push(g.index + g.segment.length);
    return ends;
  }
  return Array.from({ length: text.length }, (_, i) => i + 1);
}

/**
 * The agent demo under the hero. A captain speaks a task; the agent's trace
 * fills in step by step (running → done), like an agent run log. Runs cycle on
 * their own and can be picked by language. The loop pauses off-screen.
 */
export function AgentStrip() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });

  const [r, setR] = useState(0);
  // Server render and no-JS show the first run complete; the animation takes over in view.
  const [typed, setTyped] = useState<number>(agent.runs[0].text.length);
  const [phase, setPhase] = useState<Phase>("done");
  const [step, setStep] = useState<number>(agent.runs[0].steps.length); // steps finished so far

  const run = agent.runs[r];
  const n = run.steps.length;

  useEffect(() => {
    if (reduce) {
      setTyped(run.text.length);
      setStep(n);
      setPhase("done");
      return;
    }
    if (!inView) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((res) => timers.push(setTimeout(res, ms)));
    (async () => {
      setPhase("listen");
      setStep(0);
      setTyped(0);
      for (const end of graphemeEnds(run.text)) {
        if (!alive) return;
        setTyped(end);
        await wait(TYPE_MS);
      }
      if (!alive) return;
      await wait(350);
      setPhase("work");
      for (let s = 1; s <= n && alive; s++) {
        await wait(STEP_RUN_MS);
        if (!alive) return;
        setStep(s);
        await wait(STEP_GAP_MS);
      }
      if (!alive) return;
      setPhase("done");
      await wait(HOLD_MS);
      if (alive) setR((x) => (x + 1) % agent.runs.length);
    })();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [r, inView, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const status =
    phase === "listen" ? "Listening…" : phase === "work" ? `Working · ${Math.min(step + 1, n)} of ${n}` : `Done · ${n} steps`;
  const showReply = phase === "done" || step >= 2;

  return (
    <section ref={ref} className="od-wrap od-run" id="agent" aria-label="See the agent work">
      <header className="od-run__bar">
        <span className="od-run__id">
          <span className="od-brand__badge" aria-hidden="true">O</span>
          {agent.name}
          <span className="od-run__site">{run.site}</span>
        </span>
        <span className="od-run__tabs" role="tablist" aria-label="Example commands">
          {agent.runs.map((x, i) => (
            <button key={i} type="button" role="tab" aria-selected={i === r} data-on={i === r || undefined} onClick={() => setR(i)}>
              {x.lang}
            </button>
          ))}
        </span>
      </header>

      <div className="od-run__body">
        {/* Left: the command, and the agent's spoken reply */}
        <div className="od-run__say">
          <span className="od-run__k">{agent.you}</span>
          <div className="od-run__voice" data-live={phase === "listen" || undefined}>
            <div className="od-run__who">
              <span className="od-run__mic" aria-hidden="true">
                <Icon name="mic" />
              </span>
              {run.speaker}
              <span className="od-run__wave" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
            </div>
            <p className="od-run__text" lang={run.lang === "বাংলা" ? "bn" : undefined}>
              “{run.text.slice(0, typed)}
              {typed >= run.text.length ? "”" : <span className="od-run__caret" aria-hidden="true" />}
            </p>
            <span className="od-run__lang">{phase === "listen" ? "listening…" : `${run.lang} · voice note`}</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {showReply ? (
              <motion.div
                key={r}
                className="od-run__reply"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: "spring", duration: 0.45, bounce: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="od-run__av" src={agent.replier.photo} alt="" width={36} height={36} />
                <div className="od-run__said">
                  <span className="od-run__by">{agent.replier.name}</span>
                  <p>
                    <Rich text={run.reply} />
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="od-run__reply od-run__reply--ghost" aria-hidden="true" />
            )}
          </AnimatePresence>
        </div>

        {/* Right: the trace of what the agent did */}
        <div className="od-run__log">
          <div className="od-run__loghead">
            <span className="od-run__k">{agent.it}</span>
            <span className="od-run__state" aria-live="polite" data-done={phase === "done" || undefined}>
              <span className="od-live" aria-hidden="true" />
              {status}
            </span>
          </div>
          <div className="od-run__bar2" aria-hidden="true">
            <i style={{ transform: `scaleX(${phase === "listen" ? 0 : step / n})` }} />
          </div>
          <ol className="od-trace" key={r}>
            {run.steps.map((s, i) => {
              const state = i < step ? "done" : i === step && phase === "work" ? "run" : "wait";
              return (
                <li key={s.label + i} className={`od-trace__row is-${state}`}>
                  <span className="od-trace__ico" aria-hidden="true">
                    <Icon name={s.icon} />
                  </span>
                  <span className="od-trace__main">
                    <b>{s.label}</b>
                    <span>{state === "wait" ? " " : state === "run" ? "working…" : s.detail}</span>
                  </span>
                  <span className="od-trace__time">{state === "done" ? s.time : ""}</span>
                  <span className="od-trace__mark" aria-label={state === "done" ? "done" : state === "run" ? "running" : "waiting"} />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
