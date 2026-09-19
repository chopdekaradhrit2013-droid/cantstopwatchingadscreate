import { upsertBrand, listRemoteBrands } from "./catalog";

export const BOARD_ID = "cswa-admin-board";
export const BOARD_KEY = "cswa-admin-board-v1";
export const ACCOUNTS_KEY = "cswa-local-accounts-v1";
export const DURATIONS = [
  { label: "1 hour", ms: 60 * 60 * 1000 },
  { label: "12 hours", ms: 12 * 60 * 60 * 1000 },
  { label: "1 day", ms: 24 * 60 * 60 * 1000 },
  { label: "7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "31 days", ms: 31 * 24 * 60 * 60 * 1000 },
];
export type Announcement = { id: string; text: string; until: string };
export type PlanGrant = { email: string; plan: "plus" | "premium" };
export type PayClaim = { id: string; email: string; plan: "plus" | "premium"; amount: number; note: string; at: string; status: "pending" | "approved" | "rejected" };
export type InboxItem = { id: string; message: string; createdAt: string; read: boolean };
export type LocalAccount = { email: string; password: string; phone?: string; kind: "user" | "brand" };
export type AdminBoard = { announcements: Announcement[]; bannedEmails: string[]; bannedPhones: string[]; bannedBrandIds: string[]; grants: PlanGrant[]; claims: PayClaim[]; inbox: InboxItem[] };
export const emptyBoard = (): AdminBoard => ({ announcements: [], bannedEmails: [], bannedPhones: [], bannedBrandIds: [], grants: [], claims: [], inbox: [] });
export function readLocalBoard(): AdminBoard {
  if (typeof window === "undefined") return emptyBoard();
  try { return { ...emptyBoard(), ...JSON.parse(localStorage.getItem(BOARD_KEY) || "{}") }; } catch { return emptyBoard(); }
}
export function writeLocalBoard(board: AdminBoard) { localStorage.setItem(BOARD_KEY, JSON.stringify(board)); }
export function activeAnnouncements(board: AdminBoard) { return board.announcements.filter((a) => new Date(a.until).getTime() > Date.now()); }
export function isBanned(board: AdminBoard, email?: string, phone?: string) {
  const e = (email || "").toLowerCase(); const p = (phone || "").replace(/\s/g, "");
  return board.bannedEmails.some((x) => x.toLowerCase() === e) || (!!p && board.bannedPhones.includes(p));
}
export async function pullBoard(): Promise<AdminBoard> {
  const local = readLocalBoard();
  try {
    const brands = await listRemoteBrands();
    const row = brands.find((b) => b.id === BOARD_ID);
    if (row?.description) { const parsed = { ...emptyBoard(), ...JSON.parse(row.description) } as AdminBoard; writeLocalBoard(parsed); return parsed; }
  } catch {}
  return local;
}
export async function pushBoard(board: AdminBoard) {
  writeLocalBoard(board);
  try {
    await upsertBrand({ id: BOARD_ID, name: "CSWA Admin Board", handle: "cswaadmin", description: JSON.stringify(board), website: "", industry: "Other", logo: "", contact_email: "chopdekaradhrit2013@gmail.com", followers: 0 });
  } catch {}
}
export function listLocalAccounts(): LocalAccount[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); } catch { return []; }
}
export function rememberAccount(acc: LocalAccount) {
  const next = listLocalAccounts().filter((a) => a.email.toLowerCase() !== acc.email.toLowerCase());
  next.unshift(acc);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
}
