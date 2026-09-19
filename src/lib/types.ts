export type Category =
  | "Fashion"
  | "Sports"
  | "Food"
  | "Technology"
  | "Beauty"
  | "Gaming"
  | "Automotive"
  | "Travel"
  | "Entertainment"
  | "Other";

export const CATEGORIES: Category[] = [
  "Fashion",
  "Sports",
  "Food",
  "Technology",
  "Beauty",
  "Gaming",
  "Automotive",
  "Travel",
  "Entertainment",
  "Other",
];

export type AdStyle =
  | "Minimal"
  | "Cinematic"
  | "Product Showcase"
  | "Promotional"
  | "Lifestyle"
  | "Bold"
  | "Luxury"
  | "Fun";

export const AD_STYLES: AdStyle[] = [
  "Minimal",
  "Cinematic",
  "Product Showcase",
  "Promotional",
  "Lifestyle",
  "Bold",
  "Luxury",
  "Fun",
];

export type AdStatus = "published" | "draft" | "scheduled";
export type PlanId = "free" | "plus" | "premium";

export const PLAN_LIMITS: Record<PlanId, number> = {
  free: 1,
  plus: 5,
  premium: 15,
};

export type BrandProfile = {
  id: string;
  name: string;
  handle: string;
  email: string;
  description: string;
  website: string;
  industry: Category;
  logo: string;
  contactEmail: string;
  instagram: string;
  twitter: string;
  youtube: string;
  followers: number;
};

export type Advertisement = {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  description: string;
  media: string;
  category: Category;
  style: AdStyle;
  product: string;
  cta: string;
  destinationUrl: string;
  status: AdStatus;
  createdAt: string;
  views: number;
  likes: number;
  saves: number;
  clicks: number;
};

export type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
};
