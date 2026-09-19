"use client";
import { useStore } from "@/lib/store";
export default function NotificationsPage() {
  const { notifications } = useStore();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <p className="mt-1 text-sm text-neutral-500">Publish and draft events only. No dummy alerts.</p>
      <ul className="mt-6 space-y-3">
        {notifications.length === 0 && <li className="rounded-2xl border border-dashed p-8 text-center text-sm text-neutral-500">There are no notifications yet.</li>}
        {notifications.map((n) => (
          <li key={n.id} className="rounded-2xl border bg-white p-4 text-sm">{n.message}</li>
        ))}
      </ul>
    </div>
  );
}
