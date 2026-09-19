"use client";
import { useState } from "react";
import { Modal } from "@/components/ui";
import { emptyBoard, pullBoard, pushBoard } from "@/lib/adminBoard";
import { FAMPAY_UPI, PLAN_PRICE, couponOff, payable, qrUrl, upiLink } from "@/lib/pay";
import { useStore } from "@/lib/store";
import { PLAN_LIMITS, type PlanId } from "@/lib/types";

const plans: { id: PlanId; name: string; price: string; points: string[] }[] = [
  { id: "free", name: "FREE", price: "₹0", points: ["1 advertisement/month", "Basic analytics"] },
  { id: "plus", name: "PLUS", price: "₹499 / month", points: ["5 advertisements/month", "Better placement"] },
  { id: "premium", name: "PREMIUM", price: "₹1,499 / month", points: ["15 advertisements/month", "Priority discovery"] },
];

function payCode() {
  return `CSWA-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export default function SubscriptionPage() {
  const { plan, setPlan, publishedThisMonth, userEmail } = useStore();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<"plus" | "premium" | null>(null);
  const [coupon, setCoupon] = useState("");
  const [ref, setRef] = useState("");
  const [done, setDone] = useState(false);
  const off = couponOff(coupon);
  const amount = pending ? payable(pending, coupon) : 0;
  const note = ref;

  function startPay(id: PlanId) {
    if (id === "free") { setPlan("free"); return; }
    setPending(id);
    setRef(payCode());
    setDone(false);
    setOpen(true);
  }

  async function claimPaid() {
    if (!pending || !ref) return;
    const board = await pullBoard().catch(() => emptyBoard());
    const claim = { id: crypto.randomUUID(), email: userEmail || "unknown", plan: pending, amount, note: ref, at: new Date().toISOString(), status: "pending" as const };
    const inbox = [{ id: crypto.randomUUID(), message: `Payment claim ${ref}: ${userEmail || "brand"} paid ₹${amount} for ${pending}. Check FamPay note ${ref}.`, createdAt: new Date().toISOString(), read: false }, ...(board.inbox || [])];
    await pushBoard({ ...board, claims: [claim, ...(board.claims || [])], inbox });
    setDone(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Subscription</h1>
      <p className="mt-1 text-sm text-neutral-500">Put the payment code in the UPI note. Admin unlocks after checking FamPay (every 1–2 days).</p>
      <p className="text-sm text-neutral-500">Usage {publishedThisMonth}/{PLAN_LIMITS[plan]} · {plan}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <article key={p.id} className={`rounded-2xl border bg-white p-5 ${plan === p.id ? "border-neutral-900" : "border-neutral-200"}`}>
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">{p.price}</p>
            <ul className="mt-3 space-y-1 text-sm text-neutral-600">{p.points.map((x) => <li key={x}>• {x}</li>)}</ul>
            <button type="button" onClick={() => startPay(p.id)} className="mt-5 w-full rounded-full bg-neutral-900 py-2 text-sm text-white">
              {plan === p.id ? "Current plan" : p.id === "free" ? "Switch to Free" : "Pay with FamPay"}
            </button>
          </article>
        ))}
      </div>
      <Modal open={open} title={pending ? `Pay for ${pending}` : "Pay"} onClose={() => setOpen(false)}>
        {pending && !done && (
          <div className="space-y-3">
            <p className="rounded-xl bg-neutral-100 px-3 py-2 text-sm">UPI note (required): <strong className="font-mono">{ref}</strong></p>
            <p className="text-xs text-neutral-500">Paste that exact code in the payment remark / note so it shows in FamPay.</p>
            <label className="block text-sm">Coupon
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Adhrit123" className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            {off > 0 ? <p className="text-sm text-green-700">−₹{off}</p> : coupon.trim() ? <p className="text-sm text-red-600">Invalid coupon</p> : null}
            <p className="text-sm">Pay <strong>₹{amount}</strong> to {FAMPAY_UPI}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl(amount, note)} alt="UPI QR" className="mx-auto h-44 w-44 rounded-xl border bg-white p-2" />
            <a href={upiLink(amount, note)} className="block rounded-full bg-neutral-900 py-2 text-center text-white">Open UPI · note {ref}</a>
            <button type="button" className="w-full rounded-full border py-2" onClick={claimPaid}>I paid with note {ref}</button>
          </div>
        )}
        {done && <p>Claim sent with note {ref}. Stay on {plan} until admin confirms FamPay.</p>}
      </Modal>
    </div>
  );
}
