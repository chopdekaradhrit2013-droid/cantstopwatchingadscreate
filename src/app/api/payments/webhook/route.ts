import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { PLAN_PRICES, isPaidPlan } from "@/lib/payment-config";

function signature(raw: string, secret: string) { return crypto.createHmac("sha256", secret).update(raw).digest("hex"); }
function signaturesMatch(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return providedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}
export async function POST(request: Request) {
  const raw = await request.text();
  const provided = request.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !provided || !signaturesMatch(provided, signature(raw, secret))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid payload" }, { status: 400 }); }
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
