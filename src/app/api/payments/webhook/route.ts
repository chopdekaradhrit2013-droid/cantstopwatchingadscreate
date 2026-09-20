import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { PLAN_PRICES, isPaidPlan } from "@/lib/payment-config";

function signature(raw: string) { return crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!).update(raw).digest("hex"); }
export async function POST(request: Request) {
  const raw = await request.text();
  const provided = request.headers.get("x-razorpay-signature") || "";
  if (!provided || !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(signature(raw)))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  const payload = JSON.parse(raw);
  const event = payload.event;
  const payment = payload.payload?.payment?.entity;
  const order = payload.payload?.order?.entity;
  if (event !== "payment.captured" || !payment?.order_id) return NextResponse.json({ received: true });
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: existing } = await admin.from("payments").select("*").eq("razorpay_order_id", payment.order_id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Unknown order" }, { status: 400 });
  if (existing.status === "paid" && existing.webhook_verified) return NextResponse.json({ received: true, duplicate: true });
  const valid = payment.status === "captured" && payment.amount === existing.amount && payment.currency === existing.currency && isPaidPlan(existing.plan) && existing.amount === PLAN_PRICES[existing.plan];
  if (!valid) { await admin.from("payments").update({ status: "failed", webhook_verified: true, updated_at: new Date().toISOString() }).eq("id", existing.id); return NextResponse.json({ error: "Payment mismatch" }, { status: 400 }); }
  const { error: paymentError } = await admin.from("payments").update({ razorpay_payment_id: payment.id, status: "paid", webhook_verified: true, updated_at: new Date().toISOString() }).eq("id", existing.id).neq("status", "paid");
  if (paymentError) return NextResponse.json({ error: "Could not record payment" }, { status: 500 });
  await admin.from("profiles").update({ plan: existing.plan, subscription_status: "active", plan_activated_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("user_id", existing.user_id);
  return NextResponse.json({ received: true });
}
