import type { PlanId } from "./types";

export const PLAN_PRICES: Record<Exclude<PlanId, "free">, number> = { plus: 49900, premium: 149900 };
export const PLAN_LABELS = { plus: "Plus", premium: "Premium" } as const;

export function isPaidPlan(value: unknown): value is "plus" | "premium" {
  return value === "plus" || value === "premium";
}
