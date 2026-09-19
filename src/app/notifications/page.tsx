"use client";
import { useEffect, useState } from "react";
import { isAdminEmail } from "@/lib/admin";
import { pullBoard, pushBoard, type InboxItem } from "@/lib/adminBoard";
import { useStore } from "@/lib/store";

export default function NotificationsPage() {
  const { notifications, userEmail } = useStore();
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const admin = isAdminEmail(userEmail);

  useEffect(() => {
    pullBoard().then((b) => setInbox(b.inbox || [])).catch(() => {});
  }, []);

  async function markRead(id: string) {
    const board = await pullBoard();
    const next = { ...board, inbox: (board.inbox || []).map((n) => n.id === id ? { ...n, read: true } : n) };
    await pushBoard(next);
    setInbox(next.inbox);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {admin && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold">Admin inbox</h2>
          <ul className="mt-3 space-y-3">
            {inbox.length === 0 && <li className="rounded-2xl border border-dashed p-6 text-center text-sm text-neutral-500">No payment claims yet.</li>}
            {inbox.map((n) => (
              <li key={n.id} className={`rounded-2xl border bg-white p-4 text-sm ${n.read ? "opacity-60" : ""}`}>
                <p>{n.message}</p>
                <p className="mt-1 text-xs text-neutral-400">{new Date(n.createdAt).toLocaleString()}</p>
                {!n.read && <button type="button" className="mt-2 text-xs underline" onClick={() => markRead(n.id)}>Mark read</button>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-8">
        <h2 className="text-sm font-semibold">Your brand</h2>
        <ul className="mt-3 space-y-3">
          {notifications.length === 0 && <li className="rounded-2xl border border-dashed p-6 text-center text-sm text-neutral-500">There are no notifications yet.</li>}
          {notifications.map((n) => (
            <li key={n.id} className="rounded-2xl border bg-white p-4 text-sm">{n.message}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
