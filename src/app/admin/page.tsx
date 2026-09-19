"use client";
import { useEffect, useState } from "react";
import { isAdminEmail, isAdminLogin } from "@/lib/admin";
import { deleteRemoteAd, listAllAds, listRemoteBrands, upsertBrand } from "@/lib/catalog";
import { BOARD_ID, DURATIONS, activeAnnouncements, emptyBoard, listLocalAccounts, pullBoard, pushBoard, type AdminBoard } from "@/lib/adminBoard";
import { useStore } from "@/lib/store";

export default function AdminPage() {
  const { userEmail, login } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [board, setBoard] = useState<AdminBoard>(emptyBoard());
  const [ads, setAds] = useState<{ id: string; title: string; brand_name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [text, setText] = useState("");
  const [dur, setDur] = useState(DURATIONS[2].ms);
  const allowed = isAdminEmail(userEmail);

  useEffect(() => {
    if (!allowed) return;
    pullBoard().then(setBoard).catch(() => {});
    listAllAds().then(setAds).catch(() => {});
    listRemoteBrands().then((rows) => setBrands(rows.filter((b) => b.id !== BOARD_ID))).catch(() => {});
  }, [allowed]);

  const save = async (next: AdminBoard) => { setBoard(next); await pushBoard(next); };

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-6">
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <form className="mt-5 space-y-3" onSubmit={(e) => {
          e.preventDefault();
          if (!isAdminLogin(email.trim(), password)) { setError("Wrong admin email or password."); return; }
          login(email.trim());
        }}>
          <label className="block text-sm">Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-full bg-neutral-900 py-2 text-sm text-white">Sign in</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin console</h1>
      <section className="rounded-2xl border bg-white p-5 space-y-3">
        <h2 className="font-semibold">Announcement</h2>
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" rows={3} />
        <div className="flex flex-wrap gap-2">{DURATIONS.map((d) => <button key={d.label} type="button" onClick={() => setDur(d.ms)} className={`rounded-full px-3 py-1 text-xs ${dur === d.ms ? "bg-neutral-900 text-white" : "border"}`}>{d.label}</button>)}</div>
        <button type="button" className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white" onClick={() => { if (!text.trim()) return; save({ ...board, announcements: [{ id: crypto.randomUUID(), text: text.trim(), until: new Date(Date.now() + dur).toISOString() }, ...board.announcements] }); setText(""); }}>Publish</button>
        <ul className="text-sm space-y-2">{activeAnnouncements(board).map((a) => <li key={a.id}>{a.text} <button type="button" onClick={() => save({ ...board, announcements: board.announcements.filter((x) => x.id !== a.id) })}>Remove</button></li>)}</ul>
      </section>
      <section className="rounded-2xl border bg-white p-5 space-y-2">
        <h2 className="font-semibold">Ads</h2>
        {ads.map((ad) => <div key={ad.id} className="flex justify-between text-sm"><span>{ad.title} · {ad.brand_name}</span><button type="button" className="text-red-600" onClick={async () => { await deleteRemoteAd(ad.id); setAds((s) => s.filter((x) => x.id !== ad.id)); }}>Delete</button></div>)}
      </section>
      <section className="rounded-2xl border bg-white p-5 space-y-2">
        <h2 className="font-semibold">Brands</h2>
        {brands.map((b) => {
          const banned = board.bannedBrandIds.includes(b.id);
          return <div key={b.id} className="flex justify-between text-sm"><span>{b.name}</span><button type="button" onClick={() => { const bannedBrandIds = banned ? board.bannedBrandIds.filter((id) => id !== b.id) : [...board.bannedBrandIds, b.id]; save({ ...board, bannedBrandIds }); upsertBrand({ id: b.id, twitter: banned ? "" : "cswa-banned" }).catch(() => {}); }}>{banned ? "Unban" : "Ban"}</button></div>;
        })}
      </section>
      <section className="rounded-2xl border bg-white p-5 text-sm">
        <h2 className="font-semibold">Local passwords</h2>
        {listLocalAccounts().map((a) => <p key={a.email}>{a.email} · {a.password || "(not saved)"}</p>)}
      </section>
    </div>
  );
}
