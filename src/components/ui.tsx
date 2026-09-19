"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { isAdminEmail } from "@/lib/admin";
import { useStore } from "@/lib/store";
import type { VerificationStatus } from "@/lib/types";

const baseLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/ads", label: "My Ads" },
  { href: "/upload", label: "Upload Ad" },
  { href: "/analytics", label: "Analytics" },
  { href: "/profile", label: "Brand Profile" },
  { href: "/verification", label: "Business Verification" },
  { href: "/notifications", label: "Notifications" },
  { href: "/subscription", label: "Subscription" },
  { href: "/settings", label: "Settings" },
  { href: "/admin", label: "Admin" },
];

export function StatusBadge({ status }: { status: VerificationStatus | string }) {
  if (status === "verified") return <span className="text-xs">🟢 Verified Business ✓</span>;
  if (status === "pending") return <span className="text-xs">🟡 Verification Pending</span>;
  if (status === "rejected" || status === "suspended") return <span className="text-xs">🔴 {status}</span>;
  return <span className="text-xs">🔴 Unverified</span>;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { brand, userEmail, logout, verification } = useStore();
  const [open, setOpen] = useState(false);
  const links = isAdminEmail(userEmail) ? baseLinks : baseLinks.filter((l) => l.href !== "/admin");
  function doLogout() {
    logout();
    setOpen(false);
    router.push("/login");
  }
  const nav = (
    <nav className="flex flex-col gap-1 text-sm">
      {links.map((l) => {
        const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
        return (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-2 ${active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
            {l.label}
          </Link>
        );
      })}
      {userEmail ? (
        <button type="button" onClick={doLogout} className="mt-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50">Log out</button>
      ) : (
        <Link href="/login" onClick={() => setOpen(false)} className="mt-2 rounded-lg px-3 py-2">Log in</Link>
      )}
    </nav>
  );
  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-neutral-200 bg-white p-4 md:flex md:flex-col">
        <Link href="/" className="mb-6 text-sm font-semibold leading-tight">
          CAN’T STOP WATCHING ADS<span className="block text-xs font-normal text-neutral-500">CREATE</span>
        </Link>
        {nav}
        <div className="mt-auto pt-6 text-xs text-neutral-500">
          <p className="font-medium text-neutral-800">{brand.name} {verification.status === "verified" ? "✓" : ""}</p>
          <StatusBadge status={verification.status} />
          <p className="mt-1">{userEmail ?? "Guest"}</p>
        </div>
      </aside>
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
        <span className="text-sm font-semibold">CREATE</span>
        <button type="button" className="rounded-lg border px-3 py-1 text-sm" onClick={() => setOpen((v) => !v)}>Menu</button>
      </div>
      {open && <div className="border-b border-neutral-200 bg-white p-4 md:hidden">{nav}</div>}
    </>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (["/login", "/signup", "/forgot"].includes(path)) return <div className="min-h-screen px-4 py-10">{children}</div>;
  return (
    <div className="min-h-screen md:flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-neutral-500">Close</button>
        </div>
        <div className="mt-3 text-sm text-neutral-600">{children}</div>
      </div>
    </div>
  );
}

export function Bars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-36 items-end gap-2">
      {values.map((v, i) => (
        <div key={labels[i] ?? i} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t bg-neutral-900" style={{ height: `${(v / max) * 100}%` }} />
          <span className="text-[10px] text-neutral-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
