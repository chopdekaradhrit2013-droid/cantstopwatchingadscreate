"use client";
import { StatusBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
export default function AdminPage() {
  const { brand, verification, reports, adminApprove, adminReject, adminSuspend } = useStore();
  return (
    <div className="space-y-6">
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">Demo admin — local data only. Not real KYC.</p>
      <h1 className="text-2xl font-semibold">Admin review</h1>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm">
        <h2 className="font-semibold">Brand</h2>
        <p className="mt-2">{brand.name} · {brand.website || "no website"}</p>
        <p className="mt-1">Method: {verification.verificationMethod || "—"} · <StatusBadge status={verification.status} /></p>
        <p className="mt-1 text-neutral-500">{verification.legalBusinessName} · {verification.businessEmail}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={adminApprove} className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs text-white">Approve Verification</button>
          <button type="button" onClick={adminReject} className="rounded-full border px-3 py-1.5 text-xs">Reject Verification</button>
          <button type="button" onClick={adminSuspend} className="rounded-full border px-3 py-1.5 text-xs">Suspend Brand</button>
        </div>
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Reports</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {reports.length === 0 && <li className="text-neutral-500">No reports yet.</li>}
          {reports.map((r) => (
            <li key={r.id} className="rounded-xl border p-3">
              <p className="font-medium">Report #{r.id}</p>
              <p>Reason: {r.reason}</p>
              <p>Advertisement: {r.advertisement}</p>
              <p>Status: {r.status === "under_review" ? "Under Review" : r.status}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
