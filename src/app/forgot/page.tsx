"use client";
import Link from "next/link";
import { useState } from "react";
export default function ForgotPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <p className="mt-1 text-sm text-neutral-500">Demo only — no email is sent.</p>
      {sent ? (
        <p className="mt-4 text-sm">If this were live, a reset link would go to that inbox.</p>
      ) : (
        <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <label className="block text-sm">Email<input required type="email" className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <button type="submit" className="w-full rounded-full bg-neutral-900 py-2 text-sm text-white">Send reset link</button>
        </form>
      )}
      <Link href="/login" className="mt-4 block text-center text-sm underline">Back to log in</Link>
    </div>
  );
}
