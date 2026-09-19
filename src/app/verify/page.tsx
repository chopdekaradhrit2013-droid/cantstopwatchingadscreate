"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, type Category, type VerificationMethod } from "@/lib/types";
import { useStore } from "@/lib/store";
export default function VerifyPage() {
  const { brand, verification, saveBusinessInfo, simulateWebsite, simulateEmail, submitDocuments } = useStore();
  const router = useRouter();
  const [legal, setLegal] = useState(verification.legalBusinessName || brand.name);
  const [display, setDisplay] = useState(verification.brandName || brand.name);
  const [website, setWebsite] = useState(verification.officialWebsite || brand.website);
  const [category, setCategory] = useState<Category>(verification.category || brand.industry);
  const [email, setEmail] = useState(verification.businessEmail || brand.email);
  const [step, setStep] = useState<"info" | VerificationMethod>("info");
  const [docName, setDocName] = useState("");

  function continueInfo(e: React.FormEvent) {
    e.preventDefault();
    saveBusinessInfo({ legalBusinessName: legal, brandName: display, officialWebsite: website, category, businessEmail: email });
    setStep("website");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">Demo Verification — automated verification will be connected later.</p>
      <div>
        <h1 className="text-2xl font-semibold">Verify Your Business</h1>
        <p className="mt-1 text-sm text-neutral-500">Verification helps us confirm that you are authorized to represent this business.</p>
      </div>
      {step === "info" && (
        <form onSubmit={continueInfo} className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <label className="block text-sm">Legal / business name<input required value={legal} onChange={(e) => setLegal(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Brand / display name<input required value={display} onChange={(e) => setDisplay(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Official website<input required value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Business category<select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="mt-1 w-full rounded-xl border px-3 py-2">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="block text-sm">Business email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@example.com" className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <button type="submit" className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Continue Verification</button>
        </form>
      )}
      {step !== "info" && (
        <div className="flex flex-wrap gap-2 text-xs">
          {([["website","Website"],["email","Business email"],["documents","Documents"]] as const).map(([k,l]) => (
            <button key={k} type="button" onClick={() => setStep(k)} className={`rounded-full px-3 py-1.5 ${step===k?"bg-neutral-900 text-white":"border"}`}>{l}</button>
          ))}
        </div>
      )}
      {step === "website" && (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Recommended</p>
          <h2 className="font-semibold">Website verification</h2>
          <p className="text-sm text-neutral-600">Add this verification code to your website or verification page to prove that you control this domain.</p>
          <p className="rounded-xl bg-neutral-100 px-3 py-2 font-mono text-sm">{verification.websiteCode}</p>
          <p className="text-xs text-neutral-500">Site: {website || "https://example.com"}</p>
          <button type="button" onClick={() => { simulateWebsite(); router.push("/verification"); }} className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Simulate Website Verification</button>
        </div>
      )}
      {step === "email" && (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Business email</h2>
          <p className="text-sm text-neutral-600">We’ll send a verification link to your official business email. Demo only — no real email is sent.</p>
          <p className="text-sm">Verification email sent to {email || "hello@example.com"}</p>
          <button type="button" onClick={() => { simulateEmail(); router.push("/verification"); }} className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Simulate Email Verification</button>
        </div>
      )}
      {step === "documents" && (
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Verify with Business Documents</h2>
          <p className="text-sm text-neutral-600">Business registration, GST, Udyam, or other official documentation. Documents are not actually reviewed in this demo.</p>
          <input type="file" onChange={(e) => setDocName(e.target.files?.[0]?.name ?? "")} className="block w-full text-sm" />
          {docName && <p className="text-xs text-neutral-500">Selected: {docName}</p>}
          <button type="button" onClick={() => { submitDocuments(); router.push("/verification"); }} className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Submit for review</button>
        </div>
      )}
      <Link href="/" className="inline-block text-sm text-neutral-500 underline">Skip for now and explore dashboard</Link>
    </div>
  );
}
