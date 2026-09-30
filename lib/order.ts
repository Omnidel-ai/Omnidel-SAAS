import { addOns, plans, type AddOnId, type Billing, type PlanId } from "@/content/site";

/** A basket the visitor builds on the pricing page, carried in the URL. */
export interface Order {
  plan: PlanId;
  billing: Billing;
  addOns: AddOnId[];
}

export function orderTotal(o: Order): number {
  const plan = plans.find((p) => p.id === o.plan) ?? plans[0];
  return plan.price[o.billing] + o.addOns.reduce((s, id) => s + (addOns.find((a) => a.id === id)?.price ?? 0), 0);
}

export function orderToQuery(o: Order): string {
  const q = new URLSearchParams({ plan: o.plan, billing: o.billing });
  if (o.addOns.length) q.set("addons", o.addOns.join(","));
  return q.toString();
}

export function orderFromQuery(q: URLSearchParams): Order {
  const plan = (plans.some((p) => p.id === q.get("plan")) ? q.get("plan") : "velocity") as PlanId;
  const billing = (q.get("billing") === "yearly" ? "yearly" : "monthly") as Billing;
  const ids = (q.get("addons") ?? "").split(",").filter((id): id is AddOnId => addOns.some((a) => a.id === id));
  return { plan, billing, addOns: ids };
}
