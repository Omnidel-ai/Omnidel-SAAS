import { checkoutSteps } from "@/content/site";

export function Steps({ current }: { current: number }) {
  return (
    <div className="od-steps">
      {checkoutSteps.map((s, i) => (
        <span key={s} className={`od-step${i === current ? " is-now" : ""}`}>
          <i>{i < current ? "✓" : i + 1}</i>
          {s}
        </span>
      ))}
    </div>
  );
}
