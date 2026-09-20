"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultBrand } from "./seed";
import type { Advertisement, BrandProfile, BrandVerification, Category, ImpersonationReport, NotificationItem, PlanId } from "./types";
import { PLAN_LIMITS, emptyVerification } from "./types";
import { deleteRemoteAd, listBrandAds, toRow, upsertAd, upsertBrand } from "./catalog";
import { pullBoard } from "./adminBoard";
import { createSupabaseBrowserClient } from "./supabase-browser";

const KEY = "cswa-create-v6";

type State = {
  userEmail: string | null;
  brand: BrandProfile;
  ads: Advertisement[];
  plan: PlanId;
  notifications: NotificationItem[];
  verification: BrandVerification;
  reports: ImpersonationReport[];
};
const initial: State = {
  userEmail: null,
  brand: defaultBrand,
  ads: [],
  plan: "free",
  notifications: [],
  verification: emptyVerification(),
  reports: [],
};

type AdInput = Omit<Advertisement, "id" | "brandId" | "brandName" | "createdAt" | "views" | "likes" | "saves" | "clicks">;

type Store = State & {
  ready: boolean;
  signup: (p: { name: string; email: string; industry: Category; website: string; logo: string }) => void;
  login: (email: string) => void;
  logout: () => void;
  updateBrand: (p: Partial<BrandProfile>) => void;
  addAd: (ad: AdInput) => { ok: boolean; reason?: string };
  updateAd: (id: string, patch: Partial<Advertisement>) => { ok: boolean; reason?: string };
  deleteAd: (id: string) => void;
  duplicateAd: (id: string) => { ok: boolean };
  setPlan: (plan: PlanId) => void;
  refreshSubscription: () => Promise<void>;
  saveBusinessInfo: (p: Partial<BrandVerification>) => void;
  simulateWebsite: () => void;
  simulateEmail: () => void;
  submitDocuments: () => void;
  adminApprove: () => void;
  adminReject: () => void;
  adminSuspend: () => void;
  addReport: (r: Omit<ImpersonationReport, "id" | "createdAt" | "status">) => void;
  publishedThisMonth: number;
  limit: number;
  isVerified: boolean;
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
function pushBrand(b: BrandProfile, status: string) {
  upsertBrand({
    id: b.id, name: b.name, handle: b.handle, description: b.description, website: b.website,
    industry: b.industry, logo: b.logo, contact_email: b.contactEmail, instagram: b.instagram,
    twitter: status === "verified" ? "cswa-verified" : b.twitter, youtube: b.youtube, followers: b.followers,
  }).catch(() => {});
}
function persist(state: State) {
  const { ads, userEmail: _userEmail, plan: _plan, ...rest } = state;
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
        setState({ ...initial, ...parsed, userEmail: null, plan: "free", verification: { ...emptyVerification(), ...(parsed.verification ?? {}) }, ads: [] });
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) persist(state); }, [state, ready]);
  const refreshSubscription = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setState((s) => ({ ...s, userEmail: null, plan: "free" })); return; }
    const { data: profile } = await supabase.from("profiles").select("plan").eq("user_id", user.id).maybeSingle();
    setState((s) => ({ ...s, userEmail: user.email ?? null, plan: profile?.plan === "plus" || profile?.plan === "premium" ? profile.plan : "free" }));
  }, []);
  useEffect(() => {
    if (!ready) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;
    const syncUser = async () => { if (active) await refreshSubscription(); };
    syncUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { syncUser(); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [ready, refreshSubscription]);

  const publishedThisMonth = countPublished(state.ads);
  const limit = PLAN_LIMITS[state.plan];
  const isVerified = state.verification.status === "verified";

  const signup: Store["signup"] = useCallback((p) => {
    const handle = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16) || "brand";
    setState((s) => {
      const brand = { ...s.brand, name: p.name, handle, email: p.email, contactEmail: p.email, industry: p.industry, website: p.website, logo: p.logo || s.brand.logo };
      const verification = { ...s.verification, brandName: p.name, officialWebsite: p.website, businessEmail: p.email, category: p.industry, status: "unverified" as const };
      pushBrand(brand, "unverified");
      return { ...s, userEmail: p.email, brand, verification, plan: "free" };
    });
  }, []);
  const login = useCallback((email: string) => setState((s) => ({ ...s, userEmail: email })), []);
  const logout = useCallback(() => { createSupabaseBrowserClient().auth.signOut(); setState((s) => ({ ...s, userEmail: null, plan: "free" })); }, []);
  const updateBrand = useCallback((p: Partial<BrandProfile>) => {
    setState((s) => {
      const brand = { ...s.brand, ...p };
      pushBrand(brand, s.verification.status);
      return { ...s, brand };
    });
  }, []);

  const addAd: Store["addAd"] = useCallback((ad) => {
    let ok = true; let reason: string | undefined;
    setState((s) => {
      if (ad.status === "published" && s.verification.status !== "verified") { ok = false; reason = "unverified"; return s; }
      if (ad.status === "published" && countPublished(s.ads) >= PLAN_LIMITS[s.plan]) { ok = false; reason = "limit"; return s; }
      const createdAt = new Date().toISOString();
      const next: Advertisement = { ...ad, id: `ad-${crypto.randomUUID().slice(0, 8)}`, brandId: s.brand.id, brandName: s.brand.name, createdAt, views: 0, likes: 0, saves: 0, clicks: 0 };
      upsertAd(toRow(next)).catch(() => {});
      const note: NotificationItem = { id: `n-${next.id}`, message: next.status === "published" ? "Your advertisement was published successfully." : "Draft advertisement saved.", createdAt, read: false };
      return { ...s, ads: [next, ...s.ads], notifications: [note, ...s.notifications] };
    });
    return { ok, reason };
  }, []);

  const updateAd: Store["updateAd"] = useCallback((id, patch) => {
    let ok = true; let reason: string | undefined;
    setState((s) => {
      const current = s.ads.find((a) => a.id === id);
      if (!current) return s;
      if (patch.status === "published" && current.status !== "published" && s.verification.status !== "verified") { ok = false; reason = "unverified"; return s; }
      if (patch.status === "published" && current.status !== "published" && countPublished(s.ads) >= PLAN_LIMITS[s.plan]) { ok = false; reason = "limit"; return s; }
      const next = { ...current, ...patch };
      upsertAd(toRow(next)).catch(() => {});
      return { ...s, ads: s.ads.map((a) => (a.id === id ? next : a)) };
    });
    return { ok, reason };
  }, []);

  const deleteAd = useCallback((id: string) => { deleteRemoteAd(id).catch(() => {}); setState((s) => ({ ...s, ads: s.ads.filter((a) => a.id !== id) })); }, []);
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

  const saveBusinessInfo = useCallback((p: Partial<BrandVerification>) => {
    setState((s) => {
      const verification = { ...s.verification, ...p };
      const brand = { ...s.brand, name: p.brandName || s.brand.name, website: p.officialWebsite || s.brand.website, email: p.businessEmail || s.brand.email, industry: p.category || s.brand.industry };
      pushBrand(brand, verification.status);
      return { ...s, verification, brand };
    });
  }, []);
  const simulateWebsite = useCallback(() => {
    setState((s) => {
      const verification = { ...s.verification, websiteVerified: true, verificationMethod: "website" as const, status: "verified" as const, verifiedAt: new Date().toISOString() };
      pushBrand({ ...s.brand, twitter: "cswa-verified" }, "verified");
      return { ...s, verification, brand: { ...s.brand, twitter: "cswa-verified" } };
    });
  }, []);
  const simulateEmail = useCallback(() => {
    setState((s) => {
      const verification = { ...s.verification, emailVerified: true, verificationMethod: "email" as const, status: "verified" as const, verifiedAt: new Date().toISOString() };
      pushBrand({ ...s.brand, twitter: "cswa-verified" }, "verified");
      return { ...s, verification, brand: { ...s.brand, twitter: "cswa-verified" } };
    });
  }, []);
  const submitDocuments = useCallback(() => {
    setState((s) => ({ ...s, verification: { ...s.verification, documentsSubmitted: true, documentsStatus: "under_review", verificationMethod: "documents", status: "pending" } }));
  }, []);
  const adminApprove = useCallback(() => {
    setState((s) => {
      const verification = { ...s.verification, status: "verified" as const, documentsStatus: s.verification.documentsSubmitted ? "approved" as const : s.verification.documentsStatus, verifiedAt: new Date().toISOString() };
      pushBrand({ ...s.brand, twitter: "cswa-verified" }, "verified");
      return { ...s, verification, brand: { ...s.brand, twitter: "cswa-verified" } };
    });
  }, []);
  const adminReject = useCallback(() => setState((s) => ({ ...s, verification: { ...s.verification, status: "rejected" } })), []);
  const adminSuspend = useCallback(() => setState((s) => ({ ...s, verification: { ...s.verification, status: "suspended" } })), []);
  const addReport = useCallback((r: Omit<ImpersonationReport, "id" | "createdAt" | "status">) => {
    setState((s) => ({ ...s, reports: [{ ...r, id: String(1000 + s.reports.length + 1), createdAt: new Date().toISOString(), status: "under_review" }, ...s.reports] }));
  }, []);

  const value = useMemo<Store>(() => ({
    ...state, ready, signup, login, logout, updateBrand, addAd, updateAd, deleteAd, duplicateAd, setPlan, refreshSubscription,
    saveBusinessInfo, simulateWebsite, simulateEmail, submitDocuments, adminApprove, adminReject, adminSuspend, addReport,
    publishedThisMonth, limit, isVerified,
  }), [state, ready, signup, login, logout, updateBrand, addAd, updateAd, deleteAd, duplicateAd, setPlan, refreshSubscription, saveBusinessInfo, simulateWebsite, simulateEmail, submitDocuments, adminApprove, adminReject, adminSuspend, addReport, publishedThisMonth, limit, isVerified]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
