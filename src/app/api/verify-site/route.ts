import { NextResponse } from "next/server";

function normalize(url: string) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.toString();
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const site = normalize(String(body.website || ""));
  const code = String(body.code || "").trim();
  if (!site || !code) return NextResponse.json({ ok: false, reason: "missing" }, { status: 400 });
  try {
    const res = await fetch(site, { redirect: "follow", cache: "no-store", headers: { "User-Agent": "CSWA-Verifier/1.0" } });
    const html = await res.text();
    const found = html.includes(code);
    return NextResponse.json({ ok: found, status: res.status });
  } catch {
    return NextResponse.json({ ok: false, reason: "unreachable" }, { status: 200 });
  }
}
