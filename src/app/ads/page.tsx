"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import type { AdStatus } from "@/lib/types";
export default function MyAds() {
  const { ads, deleteAd, duplicateAd } = useStore();
  const [filter, setFilter] = useState<"all" | AdStatus>("all");
  const list = ads.filter((a) => filter === "all" || a.status === filter);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Ads</h1>
          <p className="text-sm text-neutral-500">{list.length} advertisements</p>
        </div>
        <Link href="/upload" className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Upload</Link>
      </div>
      <div className="mt-4 flex gap-2">
        {(["all", "published", "draft", "scheduled"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs capitalize ${filter === f ? "bg-neutral-900 text-white" : "border border-neutral-200 bg-white"}`}>{f}</button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <article key={a.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.media} alt="" className="aspect-video w-full object-cover" />
            <div className="p-3">
              <h2 className="font-medium">{a.title}</h2>
              <p className="text-xs text-neutral-500">{a.category} · {a.style} · {a.status}</p>
              <p className="mt-1 text-xs text-neutral-400">{a.views} views · {a.likes} likes · {a.saves} saves</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link href={`/ads/${a.id}`} className="rounded-full border px-2.5 py-1">View</Link>
                <Link href={`/upload?edit=${a.id}`} className="rounded-full border px-2.5 py-1">Edit</Link>
                <button type="button" className="rounded-full border px-2.5 py-1" onClick={() => duplicateAd(a.id)}>Duplicate</button>
                <button type="button" className="rounded-full border px-2.5 py-1" onClick={() => deleteAd(a.id)}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
