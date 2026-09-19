"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Bars } from "@/components/ui";
import { useStore } from "@/lib/store";
export default function AdDetails() {
  const { id } = useParams<{ id: string }>();
  const { ads } = useStore();
  const ad = ads.find((a) => a.id === id);
  if (!ad) return <p>Advertisement not found.</p>;
  const engagement = ad.views ? ((ad.likes + ad.saves + ad.clicks) / ad.views) * 100 : 0;
  const series = [0.4, 0.55, 0.5, 0.7, 0.62, 0.8, 1].map((f) => Math.round(ad.views * f * 0.2));
  return (
    <div className="space-y-6">
      <Link href="/ads" className="text-sm text-neutral-500">← My Ads</Link>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ad.media} alt="" className="aspect-video w-full object-cover" />
          <div className="p-5">
            <p className="text-xs uppercase text-neutral-500">{ad.category} · {ad.style} · {ad.status}</p>
            <h1 className="mt-1 text-2xl font-semibold">{ad.title}</h1>
            <p className="mt-2 text-neutral-600">{ad.description}</p>
            <p className="mt-2 text-xs text-neutral-400">Uploaded {new Date(ad.createdAt).toLocaleString()}</p>
            <Link href={`/upload?edit=${ad.id}`} className="mt-4 inline-block rounded-full border px-4 py-1.5 text-sm">Edit</Link>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Analytics</h2>
          <p className="text-sm">Views {ad.views.toLocaleString()}</p>
          <p className="text-sm">Likes {ad.likes.toLocaleString()}</p>
          <p className="text-sm">Saves {ad.saves.toLocaleString()}</p>
          <p className="text-sm">Clicks {ad.clicks.toLocaleString()}</p>
          <p className="text-sm">Engagement rate {engagement.toFixed(1)}%</p>
          <Bars values={series} labels={["D1","D2","D3","D4","D5","D6","D7"]} />
        </div>
      </div>
    </div>
  );
}
