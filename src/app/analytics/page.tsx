"use client";
import { Bars, StatCard } from "@/components/ui";
import { useStore } from "@/lib/store";
export default function AnalyticsPage() {
  const { ads, brand } = useStore();
  const views = ads.reduce((n, a) => n + a.views, 0);
  const likes = ads.reduce((n, a) => n + a.likes, 0);
  const saves = ads.reduce((n, a) => n + a.saves, 0);
  const clicks = ads.reduce((n, a) => n + a.clicks, 0);
  const engagement = likes + saves + clicks;
  const top = [...ads].sort((a, b) => b.views - a.views).slice(0, 5);
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const viewSeries = [0.5, 0.62, 0.58, 0.8, 0.74, 0.9, 1].map((f) => Math.round(views * f * 0.18));
  const engSeries = [0.4, 0.5, 0.45, 0.7, 0.6, 0.75, 0.85].map((f) => Math.round(engagement * f * 0.18));
  const interests = [{ k: "Fashion", v: 32 }, { k: "Travel", v: 24 }, { k: "Sports", v: 18 }, { k: "Technology", v: 14 }, { k: "Food", v: 12 }];
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total views" value={views.toLocaleString()} />
        <StatCard label="Total engagement" value={engagement.toLocaleString()} />
        <StatCard label="Likes" value={likes.toLocaleString()} />
        <StatCard label="Saves" value={saves.toLocaleString()} />
        <StatCard label="Website clicks" value={clicks.toLocaleString()} />
        <StatCard label="Followers gained" value={Math.round(brand.followers * 0.08).toLocaleString()} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4"><h2 className="mb-3 text-sm font-medium">Views over time</h2><Bars values={viewSeries} labels={days} /></section>
        <section className="rounded-2xl border border-neutral-200 bg-white p-4"><h2 className="mb-3 text-sm font-medium">Engagement over time</h2><Bars values={engSeries} labels={days} /></section>
      </div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium">Top-performing advertisements</h2>
        <ul className="space-y-2 text-sm">{top.map((a) => <li key={a.id} className="flex justify-between border-b py-2 last:border-0"><span>{a.title}</span><span className="text-neutral-500">{a.views.toLocaleString()} views</span></li>)}</ul>
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium">Audience interests</h2>
        <div className="space-y-2">{interests.map((i) => (
          <div key={i.k}><div className="mb-1 flex justify-between text-xs"><span>{i.k}</span><span>{i.v}%</span></div><div className="h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-neutral-900" style={{ width: `${i.v}%` }} /></div></div>
        ))}</div>
      </section>
    </div>
  );
}
