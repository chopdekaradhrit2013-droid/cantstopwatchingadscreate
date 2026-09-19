"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultBrand } from "./seed";
import type { Advertisement, BrandProfile, Category, NotificationItem, PlanId } from "./types";
import { PLAN_LIMITS } from "./types";
import { deleteRemoteAd, listBrandAds, toRow, upsertAd, upsertBrand } from "./catalog";

const KEY = "cswa-create-v3";

type State = { userEmail: string | null; brand: BrandProfile; ads: Advertisement[]; plan: PlanId; notifications: NotificationItem[] };
const initial: State = { userEmail: null, brand: defaultBrand, ads: [], plan: "plus", notifications: [] };

type AdInput = Omit<Advertisement, "id" | "brandId" | "brandName" | "createdAt" | "views" | "likes" | "saves" | "clicks">;

type Store = State & {
  ready: boolean;
  signup: (p: { name: string; email: string; industry: Category; website: string; logo: string }) => void;
  login: (email: string) => void;
  logout: () => void;
  updateBrand: (p: Partial<BrandProfile>) => void;
  addAd: (ad: AdInput) => { ok: boolean };
  updateAd: (id: string, patch: Partial<Advertisement>) => { ok: boolean };
  deleteAd: (id: string) => void;
  duplicateAd: (id: string) => { ok: boolean };
  setPlan: (plan: PlanId) => void;
  publishedThisMonth: number;
  limit: number;
};

const Ctx = createContext<Store | null>(null);
function monthKey(iso: string) { const d = new Date(iso); return `${d.getFullYear()}-${d.getMonth()}`; }
function countPublished(ads: Advertisement[]) {
  const now = monthKey(new Date().toISOString());
  return ads.filter((a) => a.status === "published" && monthKey(a.createdAt) === now).length;
}
function mapRows(rows: Awaited<ReturnType<typeof listBrandAds>>): Advertisement[] {
  return rows.map((r) => ({
    id: r.id, brandId: r.brand_id, brandName: r.brand_name, title: r.title, description: r.description,
    media: r.media, category: r.category as Advertisement["category"], style: r.style as Advertisement["style"],
    product: r.product, cta: r.cta, destinationUrl: r.destination_url, status: r.status as Advertisement["status"],
    createdAt: r.created_at, views: r.views, likes: r.likes, saves: r.saves, clicks: r.clicks,
  }));
}
function pushBrand(b: BrandProfile) {
  upsertBrand({
    id: b.id, name: b.name, handle: b.handle, description: b.description, website: b.website,
    industry: b.industry, logo: b.logo, contact_email: b.contactEmail, instagram: b.instagram,
    twitter: b.twitter, youtube: b.youtube, followers: b.followers,
  }).catch(() => {});
}
function persist(state: State) {
  const { ads, ...rest } = state;
  localStorage.setItem(KEY, JSON.stringify({ ...rest, ads: ads.map(({ media, ...a }) => ({ ...a, media: media.startsWith("data:") ? "" : media })) }));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...initial, ...parsed, ads: [] });
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) persist(state); }, [state, ready]);

  useEffect(() => {
    if (!ready) return;
    listBrandAds(state.brand.id).then((rows) => {
      setState((s) => ({ ...s, ads: mapRows(rows) }));
    }).catch(() => setState((s) => ({ ...s, ads: [] })));
    pushBrand(state.brand);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const publishedThisMonth = countPublished(state.ads);
  const limit = PLAN_LIMITS[state.plan];

  const signup: Store["signup"] = useCallback((p) => {
    const handle = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16) || "brand";
    setState((s) => {
      const brand = { ...s.brand, name: p.name, handle, email: p.email, contactEmail: p.email, industry: p.industry, website: p.website, logo: p.logo || s.brand.logo };
      pushBrand(brand);
      return { ...s, userEmail: p.email, brand };
    });
  }, []);
  const login = useCallback((email: string) => setState((s) => ({ ...s, userEmail: email })), []);
  const logout = useCallback(() => setState((s) => ({ ...s, userEmail: null })), []);
  const updateBrand = useCallback((p: Partial<BrandProfile>) => {
    setState((s) => {
      const brand = { ...s.brand, ...p };
      pushBrand(brand);
      return { ...s, brand };
    });
  }, []);

  const addAd: Store["addAd"] = useCallback((ad) => {
    let ok = true;
    setState((s) => {
      if (ad.status === "published" && countPublished(s.ads) >= PLAN_LIMITS[s.plan]) { ok = false; return s; }
      const createdAt = new Date().toISOString();
      const next: Advertisement = { ...ad, id: `ad-${crypto.randomUUID().slice(0, 8)}`, brandId: s.brand.id, brandName: s.brand.name, createdAt, views: 0, likes: 0, saves: 0, clicks: 0 };
      upsertAd(toRow(next)).catch(() => {});
      const note: NotificationItem = { id: `n-${next.id}`, message: next.status === "published" ? "Your advertisement was published successfully." : "Draft advertisement saved.", createdAt, read: false };
      return { ...s, ads: [next, ...s.ads], notifications: [note, ...s.notifications] };
    });
    return { ok };
  }, []);

  const updateAd: Store["updateAd"] = useCallback((id, patch) => {
    let ok = true;
    setState((s) => {
      const current = s.ads.find((a) => a.id === id);
      if (!current) return s;
      if (patch.status === "published" && current.status !== "published" && countPublished(s.ads) >= PLAN_LIMITS[s.plan]) { ok = false; return s; }
      const next = { ...current, ...patch };
      upsertAd(toRow(next)).catch(() => {});
      return { ...s, ads: s.ads.map((a) => (a.id === id ? next : a)) };
    });
    return { ok };
  }, []);

  const deleteAd = useCallback((id: string) => {
    deleteRemoteAd(id).catch(() => {});
    setState((s) => ({ ...s, ads: s.ads.filter((a) => a.id !== id) }));
  }, []);
  const duplicateAd: Store["duplicateAd"] = useCallback((id) => {
    setState((s) => {
      const src = s.ads.find((a) => a.id === id);
      if (!src) return s;
      const copy: Advertisement = { ...src, id: `ad-${crypto.randomUUID().slice(0, 8)}`, title: `${src.title} (copy)`, status: "draft", createdAt: new Date().toISOString(), views: 0, likes: 0, saves: 0, clicks: 0 };
      upsertAd(toRow(copy)).catch(() => {});
      return { ...s, ads: [copy, ...s.ads] };
    });
    return { ok: true };
  }, []);
  const setPlan = useCallback((plan: PlanId) => setState((s) => ({ ...s, plan })), []);

  const value = useMemo<Store>(() => ({ ...state, ready, signup, login, logout, updateBrand, addAd, updateAd, deleteAd, duplicateAd, setPlan, publishedThisMonth, limit }), [state, ready, signup, login, logout, updateBrand, addAd, updateAd, deleteAd, duplicateAd, setPlan, publishedThisMonth, limit]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
