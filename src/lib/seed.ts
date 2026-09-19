import type { Advertisement, BrandProfile, NotificationItem } from "./types";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const defaultBrand: BrandProfile = {
  id: "brand-northline",
  name: "Northline",
  handle: "northline",
  email: "studio@northline.example",
  description: "Outdoor apparel and tools made for long weather and longer walks.",
  website: "https://northline.example",
  industry: "Fashion",
  logo: img("photo-1521572163474-6864f9cf17ab"),
  contactEmail: "hello@northline.example",
  instagram: "https://instagram.com/northline",
  twitter: "https://x.com/northline",
  youtube: "https://youtube.com/@northline",
  followers: 12840,
};

export const seedAds: Advertisement[] = [
  {
    id: "ad-c1", brandId: defaultBrand.id, brandName: defaultBrand.name,
    title: "Rain Cape, City Light", description: "A cape that stays quiet in weather.",
    media: img("photo-1441974231531-c6227db76b6e"), category: "Fashion", style: "Cinematic",
    product: "Rain Cape", cta: "Shop the cape", destinationUrl: "https://northline.example/cape",
    status: "published", createdAt: "2026-09-12T10:00:00.000Z", views: 18420, likes: 940, saves: 312, clicks: 410,
  },
  {
    id: "ad-c2", brandId: defaultBrand.id, brandName: defaultBrand.name,
    title: "Trail Mug", description: "Steel that keeps heat after the last ridge.",
    media: img("photo-1501785888041-af3ef285b470"), category: "Travel", style: "Product Showcase",
    product: "Trail Mug", cta: "See the mug", destinationUrl: "https://northline.example/mug",
    status: "published", createdAt: "2026-09-04T08:00:00.000Z", views: 9210, likes: 401, saves: 188, clicks: 205,
  },
  {
    id: "ad-c3", brandId: defaultBrand.id, brandName: defaultBrand.name,
    title: "Night Pack Draft", description: "Work in progress for the autumn drop.",
    media: img("photo-1476480862126-209bfaa8edc8"), category: "Travel", style: "Minimal",
    product: "Night Pack", cta: "Join waitlist", destinationUrl: "https://northline.example/pack",
    status: "draft", createdAt: "2026-09-16T14:00:00.000Z", views: 0, likes: 0, saves: 0, clicks: 0,
  },
];

export const seedNotes: NotificationItem[] = [
  { id: "n1", message: "Your advertisement reached 10,000 views.", createdAt: "2026-09-13T09:00:00.000Z", read: false },
  { id: "n2", message: "Your advertisement was liked 500 times.", createdAt: "2026-09-12T16:00:00.000Z", read: false },
  { id: "n3", message: "Your brand gained 100 followers.", createdAt: "2026-09-10T11:00:00.000Z", read: true },
  { id: "n4", message: "Your advertisement was published successfully.", createdAt: "2026-09-12T10:05:00.000Z", read: true },
];
