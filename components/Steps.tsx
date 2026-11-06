import { checkoutSteps } from "@/content/site";

export function Steps({ current, labels = checkoutSteps }: { current: number; labels?: readonly string[] }) {
  return (
    <div className="od-steps">
      {labels.map((s, i) => (
        <span key={s} className={`od-step${i === current ? " is-now" : ""}`} aria-current={i === current ? "step" : undefined}>
          <i>{i < current ? "✓" : i + 1}</i>
          {s}
        </span>
      ))}
    </div>
  );
}
