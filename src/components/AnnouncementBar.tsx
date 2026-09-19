"use client";
import { useEffect, useState } from "react";
import { activeAnnouncements, pullBoard, type Announcement } from "@/lib/adminBoard";
export function AnnouncementBar() {
  const [items, setItems] = useState<Announcement[]>([]);
  useEffect(() => {
    pullBoard().then((b) => setItems(activeAnnouncements(b))).catch(() => {});
    const t = setInterval(() => pullBoard().then((b) => setItems(activeAnnouncements(b))).catch(() => {}), 20000);
    return () => clearInterval(t);
  }, []);
  if (!items.length) return null;
  return <div className="bg-neutral-900 px-4 py-2 text-center text-sm text-white">{items.map((a) => <p key={a.id}>{a.text}</p>)}</div>;
}
