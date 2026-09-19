export const FAMPAY_UPI = "9969613991@fam";
export const PAYEE_NAME = "CantStopWatchingAds";
export const PLAN_PRICE: Record<"plus" | "premium", number> = { plus: 499, premium: 1499 };
export const COUPONS: Record<string, number> = { ADHRIT123: 498 };

export function couponOff(code: string) {
  return COUPONS[code.trim().toUpperCase()] || 0;
}

export function payable(plan: "plus" | "premium", code: string) {
  return Math.max(1, PLAN_PRICE[plan] - couponOff(code));
}

export function upiLink(amount: number, note: string) {
  const pa = encodeURIComponent(FAMPAY_UPI);
  const pn = encodeURIComponent(PAYEE_NAME);
  const tn = encodeURIComponent(note);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${amount.toFixed(2)}&cu=INR&tn=${tn}`;
}

export function qrUrl(amount: number, note: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink(amount, note))}`;
}
