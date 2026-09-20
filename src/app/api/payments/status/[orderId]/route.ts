import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderId } = await params;
  const { data, error } = await supabase.from("payments").select("status, plan, webhook_verified, razorpay_payment_id").eq("razorpay_order_id", orderId).eq("user_id", user.id).maybeSingle();
  if (error || !data) return NextResponse.json({ status: "unknown" }, { status: 404 });
  return NextResponse.json(data);
}
