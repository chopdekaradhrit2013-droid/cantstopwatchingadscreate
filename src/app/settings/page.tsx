"use client";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
export default function SettingsPage() {
  const { brand, plan, logout } = useStore();
  const router = useRouter();
  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm">
        <p><span className="text-neutral-500">Brand </span>{brand.name}</p>
        <p><span className="text-neutral-500">Email </span>{brand.email}</p>
        <p><span className="text-neutral-500">Plan </span>{plan}</p>
        <button type="button" onClick={() => { logout(); router.push("/login"); }} className="mt-4 rounded-full border px-4 py-2">Log out</button>
      </div>
    </div>
  );
}
