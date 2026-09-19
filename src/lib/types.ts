export type Category =
  | "Fashion" | "Sports" | "Food" | "Technology" | "Beauty"
  | "Gaming" | "Automotive" | "Travel" | "Entertainment" | "Other";
export const CATEGORIES: Category[] = ["Fashion","Sports","Food","Technology","Beauty","Gaming","Automotive","Travel","Entertainment","Other"];
export type AdStyle = "Minimal" | "Cinematic" | "Product Showcase" | "Promotional" | "Lifestyle" | "Bold" | "Luxury" | "Fun";
export const AD_STYLES: AdStyle[] = ["Minimal","Cinematic","Product Showcase","Promotional","Lifestyle","Bold","Luxury","Fun"];
export type AdStatus = "published" | "draft" | "scheduled";
export type PlanId = "free" | "plus" | "premium";
export const PLAN_LIMITS: Record<PlanId, number> = { free: 1, plus: 5, premium: 15 };
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected" | "suspended";
export type VerificationMethod = "website" | "email" | "documents" | "";
export type BrandVerification = {
  status: VerificationStatus;
  legalBusinessName: string;
  brandName: string;
  officialWebsite: string;
  businessEmail: string;
  category: Category;
  websiteVerified: boolean;
  emailVerified: boolean;
  documentsSubmitted: boolean;
  documentsStatus: "none" | "under_review" | "approved" | "rejected";
  verificationMethod: VerificationMethod;
  websiteCode: string;
  verifiedAt: string | null;
};
export const emptyVerification = (): BrandVerification => ({
  status: "unverified",
  legalBusinessName: "",
  brandName: "",
  officialWebsite: "",
  businessEmail: "",
  category: "Fashion",
  websiteVerified: false,
  emailVerified: false,
  documentsSubmitted: false,
  documentsStatus: "none",
  verificationMethod: "",
  websiteCode: `CSWA-${Math.floor(10000 + Math.random() * 90000)}`,
  verifiedAt: null,
});
export type ImpersonationReport = {
  id: string;
  reason: string;
  advertisement: string;
  adId: string;
  status: "under_review" | "resolved" | "dismissed";
  createdAt: string;
};
export type BrandProfile = {
  id: string; name: string; handle: string; email: string; description: string;
  website: string; industry: Category; logo: string; contactEmail: string;
  instagram: string; twitter: string; youtube: string; followers: number;
};
export type Advertisement = {
  id: string; brandId: string; brandName: string; title: string; description: string;
  media: string; category: Category; style: AdStyle; product: string; cta: string;
  destinationUrl: string; status: AdStatus; createdAt: string; views: number; likes: number; saves: number; clicks: number;
};
export type NotificationItem = { id: string; message: string; createdAt: string; read: boolean };
