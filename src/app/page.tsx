"use client";
import Link from "next/link";
import { StatCard } from "@/components/ui";
import { useStore } from "@/lib/store";
export default function Dashboard() {
  const { ads, brand, publishedThisMonth, limit, plan } = useStore();
  const views = ads.reduce((n, a) => n + a.views, 0);
  const likes = ads.reduce((n, a) => n + a.likes, 0);
  const saves = ads.reduce((n, a) => n + a.saves, 0);
  const recent = [...ads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-500">{brand.name} · {plan.toUpperCase()} · {publishedThisMonth} / {limit} ads this month</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Ads uploaded" value={ads.length} />
        <StatCard label="Total views" value={views.toLocaleString()} />
        <StatCard label="Total likes" value={likes.toLocaleString()} />
        <StatCard label="Total saves" value={saves.toLocaleString()} />
        <StatCard label="Brand followers" value={brand.followers.toLocaleString()} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/upload" className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">Upload New Ad</Link>
        <Link href="/profile" className="rounded-full border border-neutral-300 px-4 py-2 text-sm">View Brand Profile</Link>
        <Link href="/analytics" className="rounded-full border border-neutral-300 px-4 py-2 text-sm">View Analytics</Link>
      </div>
      <section className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs text-neutral-500">
            <tr><th className="px-4 py-3">Ad</th><th>Status</th><th>Views</th><th>Likes</th><th>Saves</th><th>Date</th></tr>
          </thead>
          <tbody>
            {recent.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/ads/${a.id}`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.media} alt="" className="h-10 w-14 rounded object-cover" />{a.title}
                  </Link>
                </td>
                <td className="capitalize">{a.status}</td>
                <td>{a.views.toLocaleString()}</td>
                <td>{a.likes.toLocaleString()}</td>
                <td>{a.saves.toLocaleString()}</td>
                <td>{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
