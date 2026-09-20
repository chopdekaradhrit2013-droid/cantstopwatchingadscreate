import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isPaidPlan, PLAN_PRICES } from "@/lib/payment-config";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const plan = body.plan;
  if (!isPaidPlan(plan)) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  const amount = PLAN_PRICES[plan];
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return NextResponse.json({ error: "Razorpay is not configured on the server." }, { status: 503 });
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const order = await razorpay.orders.create({ amount, currency: "INR", receipt: `cswa_${user.id.slice(0, 12)}_${Date.now()}`, notes: { user_id: user.id, plan, email: user.email ?? "" } });
  const { error } = await supabase.from("payments").insert({ user_id: user.id, plan, amount, currency: "INR", razorpay_order_id: order.id, status: "created", webhook_verified: false });
  if (error) return NextResponse.json({ error: "Could not save payment order." }, { status: 500 });
  return NextResponse.json({ orderId: order.id, amount, currency: "INR", keyId, plan });
}
