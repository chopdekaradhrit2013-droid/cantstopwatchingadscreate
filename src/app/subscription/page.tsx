"use client";
import { useState } from "react";
import { Modal } from "@/components/ui";
import { useStore } from "@/lib/store";
import { PLAN_LIMITS, type PlanId } from "@/lib/types";
const plans: { id: PlanId; name: string; points: string[] }[] = [
  { id: "free", name: "FREE", points: ["1 advertisement/month", "Basic analytics", "Standard placement"] },
  { id: "plus", name: "PLUS", points: ["5 advertisements/month", "Advanced analytics", "Better placement", "More customization", "Scheduling"] },
  { id: "premium", name: "PREMIUM", points: ["15 advertisements/month", "Advanced analytics", "Premium placement", "Priority discovery", "More customization", "Featured opportunities"] },
];
export default function SubscriptionPage() {
  const { plan, setPlan, publishedThisMonth } = useStore();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PlanId | null>(null);
  return (
    <div>
      <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm">DEMO — Payments are coming soon</p>
      <h1 className="mt-4 text-2xl font-semibold">Subscription</h1>
      <p className="text-sm text-neutral-500">Current usage: {publishedThisMonth} / {PLAN_LIMITS[plan]} advertisements used</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <article key={p.id} className={`rounded-2xl border bg-white p-5 ${plan === p.id ? "border-neutral-900" : "border-neutral-200"}`}>
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <ul className="mt-3 space-y-1 text-sm text-neutral-600">{p.points.map((x) => <li key={x}>• {x}</li>)}</ul>
            <button type="button" onClick={() => { setPending(p.id); setOpen(true); }} className="mt-5 w-full rounded-full bg-neutral-900 py-2 text-sm text-white">{plan === p.id ? "Current plan" : "Upgrade"}</button>
          </article>
        ))}
      </div>
      <Modal open={open} title="Demo mode" onClose={() => setOpen(false)}>
        <p>Payments are coming soon. Your subscription will remain in demo mode.</p>
        <button type="button" onClick={() => { if (pending) setPlan(pending); setOpen(false); }} className="mt-4 rounded-full bg-neutral-900 px-4 py-2 text-white">Switch demo plan</button>
      </Modal>
    </div>
  );
}
