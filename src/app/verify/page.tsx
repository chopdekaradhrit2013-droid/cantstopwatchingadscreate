"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, type Category, type VerificationMethod } from "@/lib/types";
import { useStore } from "@/lib/store";

const SITE_CODE = "CSWA-78956";

function host(url: string) {
  try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, ""); } catch { return ""; }
}
function emailDomain(email: string) {
  return (email.split("@")[1] || "").toLowerCase();
}

export default function VerifyPage() {
  const { brand, verification, saveBusinessInfo, simulateWebsite, simulateEmail, submitDocuments } = useStore();
  const router = useRouter();
  const [legal, setLegal] = useState(verification.legalBusinessName || brand.name);
  const [display, setDisplay] = useState(verification.brandName || brand.name);
  const [website, setWebsite] = useState(verification.officialWebsite || brand.website || "https://cantstopwatchingads.vercel.app");
  const [category, setCategory] = useState<Category>(verification.category || brand.industry);
  const [email, setEmail] = useState(verification.businessEmail || brand.email);
  const [step, setStep] = useState<"info" | VerificationMethod>("info");
  const [docName, setDocName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function continueInfo(e: React.FormEvent) {
    e.preventDefault();
    saveBusinessInfo({ legalBusinessName: legal, brandName: display, officialWebsite: website, category, businessEmail: email, websiteCode: SITE_CODE });
    setStep("website");
  }

  async function checkSite() {
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/verify-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website, code: SITE_CODE }),
      });
      const data = await res.json();
      if (data.ok) { simulateWebsite(); router.push("/verification"); }
      else setMsg(data.reason === "unreachable" ? "Could not reach that website." : "Code not found on the site yet. Add it and try again.");
    } catch {
      setMsg("Check failed. Try again.");
    }
    setBusy(false);
  }

  function checkEmail() {
    const siteHost = host(website);
    const mailHost = emailDomain(email);
    if (siteHost && mailHost && (mailHost === siteHost || mailHost.endsWith("." + siteHost))) {
      simulateEmail();
      router.push("/verification");
      return;
    }
    setMsg("Email domain must match your website (e.g. hello@yourbrand.com).");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Verify Your Business</h1>
      </div>
      {step === "info" && (
        <form onSubmit={continueInfo} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <label className="block text-sm">Legal / business name<input required value={legal} onChange={(e) => setLegal(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Brand / display name<input required value={display} onChange={(e) => setDisplay(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Official website<input required value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://cantstopwatchingads.vercel.app" className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Business category<select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="mt-1 w-full rounded-xl border px-3 py-2">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="block text-sm">Business email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <button type="submit" className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Continue Verification</button>
        </form>
      )}
      {step !== "info" && (
        <div className="flex flex-wrap gap-2 text-xs">
          {([["website","Website"],["email","Business email"],["documents","Documents"]] as const).map(([k,l]) => (
            <button key={k} type="button" onClick={() => { setMsg(""); setStep(k); }} className={`rounded-full px-3 py-1.5 ${step===k?"bg-neutral-900 text-white":"border"}`}>{l}</button>
          ))}
        </div>
      )}
      {step === "website" && (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Website verification</h2>
          <p className="rounded-xl bg-neutral-100 px-3 py-2 font-mono text-sm">{SITE_CODE}</p>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button type="button" disabled={busy} onClick={checkSite} className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">{busy ? "Checking…" : "Check website now"}</button>
        </div>
      )}
      {step === "email" && (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-sm">{email} · {website}</p>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <button type="button" onClick={checkEmail} className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Verify email domain</button>
        </div>
      )}
      {step === "documents" && (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <input type="file" onChange={(e) => setDocName(e.target.files?.[0]?.name ?? "")} className="block w-full text-sm" />
          <button type="button" onClick={() => { submitDocuments(); router.push("/verification"); }} className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Submit for review</button>
        </div>
      )}
      <Link href="/" className="inline-block text-sm text-neutral-500 underline">Skip for now</Link>
    </div>
  );
}
