"use client";

import { useState } from "react";
import { showcase } from "@/content/site";
import { Rich } from "./Icon";
import { ScrollZoom } from "./Motion";

/** Real OmniDEL app screens, one per tab, in a browser frame with a couple of callouts. */
export function AppShowcase() {
  const [key, setKey] = useState<string>(showcase[0].key);
  const panel = showcase.find((s) => s.key === key) ?? showcase[0];
  return (
    <div className="od-show">
      <div className="od-show__tabs" role="tablist" aria-label="App screens">
        {showcase.map((s) => (
          <button key={s.key} type="button" role="tab" aria-selected={s.key === key} onClick={() => setKey(s.key)}>
            {s.tab}
          </button>
        ))}
      </div>
      <p className="od-show__caption">
        <b>{panel.caption[0]}</b> {panel.caption[1]}
      </p>
      <ScrollZoom className="od-show__stage">
        <div className="od-show__panel" role="tabpanel" key={panel.key}>
          {"phones" in panel ? (
            <div className="od-phones">
              {panel.phones.map((ph) => (
                <figure className="od-phone" key={ph.image}>
                  <div className="od-phone__body">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.image} alt={`Acharya app: ${ph.label}`} width={804} height={1740} loading="lazy" />
                  </div>
                  <figcaption>{ph.label}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
          <div className="od-frame">
            <div className="od-frame__bar">
              <i />
              <i />
              <i />
              <span className="od-frame__url">{panel.url}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={panel.image} alt={`OmniDEL app: ${panel.tab}`} width={1920} height={panel.key === "review" ? 666 : 1200} />
          </div>
          )}
          {panel.callouts.map((c, i) => (
            <span key={i} className={c.kind === "dark" ? "od-callout od-callout--dark" : "od-callout"} style={c.style}>
              {"value" in c ? <span className="od-callout__num">{c.value}</span> : <span className="od-live" />}
              <span>
                <Rich text={c.text} />
              </span>
            </span>
          ))}
        </div>
      </ScrollZoom>
      <span className="od-shotnote">Real OmniDEL app screens · demo data</span>
    </div>
  );
}
