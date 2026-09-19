"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { AD_STYLES, CATEGORIES, type AdStatus, type AdStyle, type Category } from "@/lib/types";

function UploadInner() {
  const { ads, addAd, updateAd, publishedThisMonth, limit, plan, isVerified } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const existing = ads.find((a) => a.id === params.get("edit"));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80");
  const [category, setCategory] = useState<Category>("Fashion");
  const [style, setStyle] = useState<AdStyle>("Minimal");
  const [product, setProduct] = useState("");
  const [cta, setCta] = useState("Learn more");
  const [destinationUrl, setDestinationUrl] = useState("https://example.com");
  const [status, setStatus] = useState<AdStatus>("draft");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!existing) return;
    setTitle(existing.title); setDescription(existing.description); setMedia(existing.media);
    setCategory(existing.category); setStyle(existing.style); setProduct(existing.product);
    setCta(existing.cta); setDestinationUrl(existing.destinationUrl); setStatus(existing.status);
  }, [existing]);

  function onFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMedia(String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (status === "published" && !isVerified) {
      setError("unverified");
      return;
    }
    const payload = { title, description, media, category, style, product, cta, destinationUrl, status };
    const result = existing ? updateAd(existing.id, payload) : addAd(payload);
    if (!result.ok) {
      setError(result.reason === "unverified" ? "unverified" : "limit");
      return;
    }
    router.push("/ads");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-2xl font-semibold">{existing ? "Edit advertisement" : "Upload Ad"}</h1>
        <p className="text-sm text-neutral-500">{plan.toUpperCase()} · {publishedThisMonth} / {limit} advertisements used this month</p>
        {!isVerified && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
            <p className="font-medium">Business verification required</p>
            <p className="mt-1">Verify your business before publishing advertisements on CAN’T STOP WATCHING ADS.</p>
            <Link href="/verify" className="mt-2 inline-block rounded-full bg-neutral-900 px-3 py-1.5 text-xs text-white">Verify Business</Link>
          </div>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <label className="block text-sm">Image / video file<input type="file" accept="image/*,video/*" className="mt-1 block w-full text-sm" onChange={(e) => onFile(e.target.files?.[0])} /></label>
          <label className="block text-sm">Or media URL<input value={media} onChange={(e) => setMedia(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Title<input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Description<textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">Category<select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="mt-1 w-full rounded-xl border px-3 py-2">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="block text-sm">Style<select value={style} onChange={(e) => setStyle(e.target.value as AdStyle)} className="mt-1 w-full rounded-xl border px-3 py-2">{AD_STYLES.map((c) => <option key={c}>{c}</option>)}</select></label>
          </div>
          <label className="block text-sm">Brand / product<input value={product} onChange={(e) => setProduct(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">CTA text<input value={cta} onChange={(e) => setCta(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Destination URL<input type="url" value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Status<select value={status} onChange={(e) => setStatus(e.target.value as AdStatus)} className="mt-1 w-full rounded-xl border px-3 py-2"><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="published">Published</option></select></label>
          {error === "unverified" && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
              <p className="font-medium">Business verification required</p>
              <p className="mt-1">Verify your business before publishing advertisements on CAN’T STOP WATCHING ADS.</p>
              <Link href="/verify" className="mt-2 inline-block rounded-full bg-neutral-900 px-3 py-1.5 text-xs text-white">Verify Business</Link>
            </div>
          )}
          {error === "limit" && <p className="text-sm text-red-600">You’ve reached your monthly advertisement limit.</p>}
          <button type="submit" className="rounded-full bg-neutral-900 px-5 py-2 text-sm text-white">{status === "published" ? "Publish Advertisement" : "Save draft"}</button>
        </form>
      </div>
      <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Viewer preview</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media} alt="" className="mt-3 aspect-[4/3] w-full rounded-xl object-cover" />
        <p className="mt-2 text-xs text-neutral-500">{category}</p>
        <p className="font-medium">{title || "Advertisement title"}</p>
        <p className="text-sm text-neutral-600">{description || "Description appears here."}</p>
        <span className="mt-3 inline-block rounded-full bg-neutral-900 px-3 py-1 text-xs text-white">{cta || "CTA"}</span>
      </aside>
    </div>
  );
}

export default function UploadPage() {
  return <Suspense fallback={<p>Loading…</p>}><UploadInner /></Suspense>;
}
