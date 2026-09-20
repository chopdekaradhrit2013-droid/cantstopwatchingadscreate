"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, type Category } from "@/lib/types";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useStore } from "@/lib/store";
export default function SignupPage() {
  const { signup } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [industry, setIndustry] = useState<Category>("Fashion");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  function onFile(file?: File) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setLogo(String(r.result));
    r.readAsDataURL(file);
  }
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await createSupabaseBrowserClient().auth.signUp({ email: email.trim(), password, options: { data: { name, industry, website } } });
    if (error) { alert(error.message); return; }
    signup({ name, email: email.trim(), industry, website, logo });
    router.push(data.session ? "/verify" : "/login");
  }
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6">
      <h1 className="text-2xl font-semibold">Create brand account</h1>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="block text-sm">Brand name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        <label className="block text-sm">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        <label className="block text-sm">Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        <label className="block text-sm">Industry<select value={industry} onChange={(e) => setIndustry(e.target.value as Category)} className="mt-1 w-full rounded-xl border px-3 py-2">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="block text-sm">Website<input value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        <label className="block text-sm">Brand logo<input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="mt-1 block w-full text-sm" /></label>
        <button type="submit" className="w-full rounded-full bg-neutral-900 py-2 text-sm text-white">Sign up</button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">Already registered? <Link href="/login" className="underline">Log in</Link></p>
    </div>
  );
}
