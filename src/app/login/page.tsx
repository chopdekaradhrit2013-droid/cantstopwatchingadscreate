"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isAdminEmail } from "@/lib/admin";
import { isBanned, pullBoard } from "@/lib/adminBoard";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useStore } from "@/lib/store";
export default function LoginPage() {
  const { login } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const board = await pullBoard();
    if (isBanned(board, email)) { setError("This account is banned."); return; }
    const { error } = await createSupabaseBrowserClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setError(error.message); return; }
    login(email.trim());
    router.push(isAdminEmail(email) ? "/admin" : "/");
  }
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="block text-sm">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        <label className="block text-sm">Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-full bg-neutral-900 py-2 text-sm text-white">Log in</button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500"><Link href="/forgot" className="underline">Forgot password</Link> · <Link href="/signup" className="underline">Sign up</Link></p>
    </div>
  );
}
