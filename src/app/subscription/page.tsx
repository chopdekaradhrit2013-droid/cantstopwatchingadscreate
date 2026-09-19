"use client";
import { useMemo, useState } from "react";
import { Modal } from "@/components/ui";
import { FAMPAY_UPI, PLAN_PRICE, couponOff, payable, qrUrl, upiLink } from "@/lib/pay";
import { useStore } from "@/lib/store";
import { PLAN_LIMITS, type PlanId } from "@/lib/types";

const plans: { id: PlanId; name: string; price: string; points: string[] }[] = [
  { id: "free", name: "FREE", price: "₹0", points: ["1 advertisement/month", "Basic analytics", "Standard placement"] },
  { id: "plus", name: "PLUS", price: "₹499 / month", points: ["5 advertisements/month", "Advanced analytics", "Better placement", "Scheduling"] },
  { id: "premium", name: "PREMIUM", price: "₹1,499 / month", points: ["15 advertisements/month", "Premium placement", "Priority discovery"] },
];

export default function SubscriptionPage() {
  const { plan, setPlan, publishedThisMonth, userEmail } = useStore();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<"plus" | "premium" | null>(null);
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);
  const off = couponOff(code);
  const amount = pending ? payable(pending, code) : 0;
  const note = useMemo(() => pending ? `CSWA ${pending} ${userEmail || "brand"}${off ? " Adhrit123" : ""}` : "CSWA", [pending, userEmail, off]);

  function startPay(id: PlanId) {
    if (id === "free") { setPlan("free"); return; }
    setPending(id);
    setDone(false);
    setOpen(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Subscription</h1>
      <p className="mt-1 text-sm text-neutral-500">Pay with UPI / FamPay to {FAMPAY_UPI}.</p>
      <p className="text-sm text-neutral-500">Usage: {publishedThisMonth} / {PLAN_LIMITS[plan]} · Current: {plan}</p>
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
            <label className="block text-sm">Coupon
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Adhrit123" className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            {off > 0 ? <p className="text-sm text-green-700">Coupon applied: −₹{off}</p> : code.trim() ? <p className="text-sm text-red-600">Invalid coupon</p> : null}
            <p className="text-sm">
              {PLAN_PRICE[pending]} {off > 0 && <>− {off} = </>}<strong>₹{amount}</strong>
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl(amount, note)} alt="UPI QR" className="mx-auto h-44 w-44 rounded-xl border bg-white p-2" />
            <p className="text-center text-xs text-neutral-500">{FAMPAY_UPI}</p>
            <a href={upiLink(amount, note)} className="block rounded-full bg-neutral-900 py-2 text-center text-white">Open UPI / FamPay · ₹{amount}</a>
            <button type="button" className="w-full rounded-full border py-2" onClick={() => { setPlan(pending); setDone(true); }}>
              I have paid — unlock {pending}
            </button>
          </div>
        )}
        {done && <p>Plan set to {pending}. Paid ₹{amount}.</p>}
      </Modal>
    </div>
  );
}
