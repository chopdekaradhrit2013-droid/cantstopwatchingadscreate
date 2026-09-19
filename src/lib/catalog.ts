const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://iugagfjbmdvemuljjeml.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2FnZmpibWR2ZW11bGpqZW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MDQ5MTQsImV4cCI6MjEwNTM4MDkxNH0.UlQaaFvZAU8TqjfqBJF0fbcOB6DpsncrPtDvbV6C7Os";

export type RemoteAd = {
  id: string; brand_id: string; brand_name: string; title: string; description: string; media: string;
  category: string; style: string; product: string; cta: string; destination_url: string; status: string;
  created_at: string; views: number; likes: number; saves: number; clicks: number;
};

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Prefer: "return=representation", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return (text ? JSON.parse(text) : []) as T;
}

export function listBrandAds(brandId: string) {
  return rest<RemoteAd[]>(`advertisements?brand_id=eq.${encodeURIComponent(brandId)}&order=created_at.desc`);
}
export function listAllAds() {
  return rest<RemoteAd[]>(`advertisements?order=created_at.desc`);
}
export function listRemoteBrands() {
  return rest<{ id: string; name: string; handle: string; description?: string; twitter?: string }[]>(`brands?order=followers.desc`);
}
export function upsertBrand(row: Record<string, unknown>) {
  return rest("brands?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(row) });
}
export function upsertAd(row: Record<string, unknown>) {
  return rest("advertisements?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(row) });
}
export function deleteRemoteAd(id: string) {
  return rest(`advertisements?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}
export function toRow(ad: {
  id: string; brandId: string; brandName: string; title: string; description: string;
  media: string; category: string; style: string; product: string; cta: string;
  destinationUrl: string; status: string; createdAt: string; views: number; likes: number; saves: number; clicks: number;
}) {
  return {
    id: ad.id, brand_id: ad.brandId, brand_name: ad.brandName, title: ad.title, description: ad.description,
    media: ad.media, category: ad.category, style: ad.style, product: ad.product, cta: ad.cta,
    destination_url: ad.destinationUrl, status: ad.status, created_at: ad.createdAt, views: ad.views, likes: ad.likes, saves: ad.saves, clicks: ad.clicks,
  };
}
