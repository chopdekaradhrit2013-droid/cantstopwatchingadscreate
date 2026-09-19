"use client";
import { useState } from "react";
import { CATEGORIES, type Category } from "@/lib/types";
import { useStore } from "@/lib/store";

function compress(file: File, cb: (url: string) => void) {
  const img = new Image();
  const reader = new FileReader();
  reader.onload = () => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 320;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return cb(String(reader.result));
      const min = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
      cb(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}

export default function ProfilePage() {
  const { brand, updateBrand } = useStore();
  const [publicView, setPublicView] = useState(false);
  function onLogo(file?: File) {
    if (!file) return;
    compress(file, (url) => updateBrand({ logo: url }));
  }
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-semibold">Brand Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">Upload a logo here. It appears on the viewer DriftWall after save.</p>
        <form className="mt-6 space-y-3 rounded-2xl border border-neutral-200 bg-white p-5" onSubmit={(e) => e.preventDefault()}>
          <label className="block text-sm">Brand name<input value={brand.name} onChange={(e) => updateBrand({ name: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Username / handle<input value={brand.handle} onChange={(e) => updateBrand({ handle: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Description<textarea value={brand.description} onChange={(e) => updateBrand({ description: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} /></label>
          <label className="block text-sm">Website<input value={brand.website} onChange={(e) => updateBrand({ website: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Industry<select value={brand.industry} onChange={(e) => updateBrand({ industry: e.target.value as Category })} className="mt-1 w-full rounded-xl border px-3 py-2">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="block text-sm">Logo file<input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} className="mt-1 block w-full text-sm" /></label>
          <label className="block text-sm">Or logo URL<input value={brand.logo.startsWith("data:") ? "" : brand.logo} onChange={(e) => updateBrand({ logo: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
          <label className="block text-sm">Contact email<input value={brand.contactEmail} onChange={(e) => updateBrand({ contactEmail: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
        </form>
      </div>
      <aside>
        <p className="text-xs uppercase tracking-wide text-neutral-500">Preview on CAN'T STOP WATCHING ADS</p>
        <div className="mt-3 rounded-2xl border border-neutral-200 bg-white p-5">
          {brand.logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={brand.logo} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-400">No logo</div>
          )}
          <h2 className="mt-3 text-xl font-semibold">{brand.name}</h2>
          <p className="text-sm text-neutral-500">@{brand.handle}</p>
          <p className="mt-2 text-sm text-neutral-600">{brand.description}</p>
          <button type="button" onClick={() => setPublicView(true)} className="mt-4 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white">View Public Profile</button>
        </div>
        {publicView && (
          <div className="fixed inset-0 z-50 overflow-auto bg-[#f6f5f2] p-6">
            <button type="button" onClick={() => setPublicView(false)} className="mb-4 text-sm underline">Close public preview</button>
            <div className="mx-auto max-w-xl rounded-3xl border bg-white p-8">
              {brand.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={brand.logo} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : null}
              <h1 className="mt-4 text-3xl font-semibold">{brand.name}</h1>
              <p className="text-neutral-500">@{brand.handle}</p>
              <p className="mt-4 text-neutral-700">{brand.description}</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
