"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui";
import { useStore } from "@/lib/store";
import { PLAN_LIMITS, type PlanId } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const plans: { id: PlanId; name: string; price: string; points: string[] }[] = [
  { id: "free", name: "FREE", price: "₹0", points: ["1 advertisement/month", "Basic analytics"] },
  { id: "plus", name: "PLUS", price: "₹499 / month", points: ["5 advertisements/month", "Better placement"] },
  { id: "premium", name: "PREMIUM", price: "₹1,499 / month", points: ["15 advertisements/month", "Priority discovery"] },
];

type PaymentState = "idle" | "loading" | "processing" | "success" | "failed" | "cancelled";

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SubscriptionPage() {
  const { plan, publishedThisMonth, userEmail, refreshSubscription } = useStore();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<"plus" | "premium" | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (pollTimer.current) clearTimeout(pollTimer.current); }, []);

  const refreshStatus = useCallback(async (id: string, attempt = 0) => {
    const response = await fetch(`/api/payments/status/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (data.status === "paid" && data.webhook_verified) {
      await refreshSubscription();
      setPaymentState("success");
      setMessage(data.plan === "premium" ? "All Premium features are now unlocked." : "Your Plus membership is now active.");
      return;
    }
    if (data.status === "failed") {
      setPaymentState("failed");
      setMessage("Payment failed. Your existing plan is unchanged.");
      return;
    }
    if (attempt < 15) {
      pollTimer.current = setTimeout(() => refreshStatus(id, attempt + 1), 2000);
      return;
    }
    setPaymentState("processing");
    setMessage("Payment received. We’re still confirming your membership. You can safely close this window and return later.");
  }, []);

  async function startPay(id: PlanId) {
    if (id === "free" || id === plan || !userEmail) return;
    setPending(id);
    setPaymentState("loading");
    setMessage("");
    setOpen(true);
    try {
      const response = await fetch("/api/payments/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: id }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not start payment.");
      const available = await loadRazorpay();
      if (!available || !window.Razorpay) throw new Error("Razorpay Checkout could not be loaded.");
      setOrderId(data.orderId);
      setPaymentState("processing");
      new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "CantStopWatchingAds",
        description: `${id === "premium" ? "Premium" : "Plus"} membership`,
        order_id: data.orderId,
        prefill: { email: userEmail },
        theme: { color: "#171717" },
        handler: () => refreshStatus(data.orderId),
        modal: { ondismiss: () => { setPaymentState("cancelled"); setMessage("Payment cancelled. Your existing plan is unchanged."); } },
      }).open();
    } catch (error) {
      setPaymentState("failed");
      setMessage(error instanceof Error ? error.message : "Could not start payment.");
    }
  }

  const close = () => { setOpen(false); setPending(null); setOrderId(null); setPaymentState("idle"); setMessage(""); };
  const isTerminal = paymentState === "success" || paymentState === "failed" || paymentState === "cancelled";

  return (
    <div>
      <h1 className="text-2xl font-semibold">Subscription</h1>
      <p className="mt-1 text-sm text-neutral-500">Choose the plan that fits your advertising goals. Payments are securely confirmed before access changes.</p>
      <p className="text-sm text-neutral-500">Usage {publishedThisMonth}/{PLAN_LIMITS[plan]} · {plan}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <article key={p.id} className={`rounded-2xl border bg-white p-5 ${plan === p.id ? "border-neutral-900" : "border-neutral-200"}`}>
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 text-sm text-neutral-500">{p.price}</p>
            <ul className="mt-3 space-y-1 text-sm text-neutral-600">{p.points.map((x) => <li key={x}>• {x}</li>)}</ul>
            <button type="button" onClick={() => startPay(p.id)} disabled={plan === p.id || !userEmail} className="mt-5 min-h-11 w-full rounded-full bg-neutral-900 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50">
              {plan === p.id ? "Current plan" : p.id === "free" ? "Free plan" : "Upgrade securely"}
            </button>
          </article>
        ))}
      </div>
      <Modal open={open} title={pending ? `Upgrade to ${pending === "premium" ? "Premium" : "Plus"}` : "Payment"} onClose={close}>
        <div className="flex flex-col gap-4">
          {paymentState === "loading" && <p className="text-sm text-neutral-600">Preparing secure checkout…</p>}
          {paymentState === "processing" && <div className="rounded-xl bg-neutral-100 p-4 text-sm"><p className="font-medium">Confirming your payment…</p><p className="mt-1 text-neutral-600">Payment access stays locked until Razorpay confirms it on our server.</p></div>}
          {paymentState === "success" && <div className="rounded-xl bg-neutral-100 p-5 text-center"><div className="text-3xl" aria-hidden="true">🎉</div><h3 className="mt-2 text-xl font-semibold">PAYMENT SUCCESSFUL</h3><p className="mt-2">Welcome to {pending === "premium" ? "Premium" : "Plus"}!</p><p className="mt-1 text-sm text-neutral-600">{message}</p></div>}
          {isTerminal && paymentState !== "success" && <div className="rounded-xl bg-neutral-100 p-4 text-sm"><p className="font-medium">{paymentState === "cancelled" ? "Payment cancelled." : "Payment failed."}</p><p className="mt-1 text-neutral-600">{message}</p></div>}
          {paymentState === "processing" && orderId && <p className="text-xs text-neutral-500">Order: {orderId}</p>}
          {isTerminal && <button type="button" onClick={paymentState === "success" ? close : () => pending && startPay(pending)} className="min-h-11 w-full rounded-full bg-neutral-900 py-2 text-sm text-white">{paymentState === "success" ? "Continue" : "Try again"}</button>}
        </div>
      </Modal>
    </div>
  );
}
