export type RemoteAd = {
  id: string;
  brand_id: string;
  brand_name: string;
  title: string;
  description: string;
  media: string;
  category: string;
  style: string;
  product: string;
  cta: string;
  destination_url: string;
  status: string;
  created_at: string;
  views: number;
  likes: number;
  saves: number;
  clicks: number;
};

function cfg() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export function hasBackend() {
  return Boolean(cfg());
}

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const c = cfg();
  if (!c) throw new Error("Backend not configured");
  const res = await fetch(`${c.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return (text ? JSON.parse(text) : []) as T;
}

export function listBrandAds(brandId: string) {
  return rest<RemoteAd[]>(`advertisements?brand_id=eq.${encodeURIComponent(brandId)}&order=created_at.desc`);
}

export function upsertBrand(row: Record<string, unknown>) {
  return rest("brands?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row),
  });
}

export function upsertAd(row: Record<string, unknown>) {
  return rest("advertisements?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row),
  });
}

export function deleteRemoteAd(id: string) {
  return rest(`advertisements?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}
