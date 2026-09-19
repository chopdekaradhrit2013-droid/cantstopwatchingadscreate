"use client";
import { useStore } from "@/lib/store";
export default function NotificationsPage() {
  const { notifications } = useStore();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <ul className="mt-6 space-y-3">
        {notifications.map((n) => (
          <li key={n.id} className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm">
            {n.message}
            <p className="mt-1 text-xs text-neutral-400">{new Date(n.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
