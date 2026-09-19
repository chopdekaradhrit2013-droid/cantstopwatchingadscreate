"use client";
import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
export default function VerificationDashboard() {
  const { verification, brand } = useStore();
  const v = verification;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Business Verification</h1>
          <p className="text-sm text-neutral-500">{brand.name} <StatusBadge status={v.status} /></p>
        </div>
        <Link href="/verify" className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Continue verification</Link>
      </div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Business Information</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-neutral-500">Legal name</dt><dd>{v.legalBusinessName || "—"}</dd></div>
          <div><dt className="text-neutral-500">Brand name</dt><dd>{v.brandName || brand.name}</dd></div>
          <div><dt className="text-neutral-500">Website</dt><dd>{v.officialWebsite || brand.website || "—"}</dd></div>
          <div><dt className="text-neutral-500">Business email</dt><dd>{v.businessEmail || brand.email || "—"}</dd></div>
          <div><dt className="text-neutral-500">Category</dt><dd>{v.category}</dd></div>
        </dl>
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Verification checklist</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>{v.legalBusinessName ? "✓" : "○"} Business information submitted</li>
          <li>{v.websiteVerified ? "✓" : "○"} Website verified (live page check)</li>
          <li>{v.emailVerified ? "✓" : "○"} Email domain matches website</li>
          <li>{v.documentsSubmitted ? "✓" : "○"} Documents {v.documentsStatus === "under_review" ? "(Under Review)" : ""}</li>
        </ul>
        <p className="mt-4 text-sm"><StatusBadge status={v.status} /></p>
      </section>
    </div>
  );
}
