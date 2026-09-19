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
  const byCat = ads.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + a.views + a.likes;
    return acc;
  }, {});
  const interests = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(...interests.map(([, v]) => v), 1);
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const viewSeries = days.map((_, i) => Math.round((views / 7) * ((i + 3) / 9)));
  const engSeries = days.map((_, i) => Math.round((engagement / 7) * ((i + 3) / 9)));
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="text-sm text-neutral-500">Numbers come from your published ads in Supabase. Empty charts mean no live data yet.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total views" value={views.toLocaleString()} />
        <StatCard label="Total engagement" value={engagement.toLocaleString()} />
        <StatCard label="Likes" value={likes.toLocaleString()} />
        <StatCard label="Saves" value={saves.toLocaleString()} />
        <StatCard label="Website clicks" value={clicks.toLocaleString()} />
        <StatCard label="Followers" value={brand.followers.toLocaleString()} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-neutral-200 bg-white p-4"><h2 className="mb-3 text-sm font-medium">Views snapshot</h2>{views === 0 ? <p className="text-sm text-neutral-500">No views yet.</p> : <Bars values={viewSeries} labels={days} />}</section>
        <section className="rounded-2xl border border-neutral-200 bg-white p-4"><h2 className="mb-3 text-sm font-medium">Engagement snapshot</h2>{engagement === 0 ? <p className="text-sm text-neutral-500">No engagement yet.</p> : <Bars values={engSeries} labels={days} />}</section>
      </div>
      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium">Top-performing advertisements</h2>
        {top.length === 0 ? <p className="text-sm text-neutral-500">No ads yet.</p> : <ul className="space-y-2 text-sm">{top.map((a) => <li key={a.id} className="flex justify-between border-b py-2 last:border-0"><span>{a.title}</span><span className="text-neutral-500">{a.views.toLocaleString()} views</span></li>)}</ul>}
      </section>
      <section className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-medium">Category mix from your ads</h2>
        {interests.length === 0 ? <p className="text-sm text-neutral-500">Publish ads to see this.</p> : <div className="space-y-2">{interests.map(([k, v]) => (
          <div key={k}><div className="mb-1 flex justify-between text-xs"><span>{k}</span><span>{Math.round((v / max) * 100)}%</span></div><div className="h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full bg-neutral-900" style={{ width: `${Math.round((v / max) * 100)}%` }} /></div></div>
        ))}</div>}
      </section>
    </div>
  );
}
