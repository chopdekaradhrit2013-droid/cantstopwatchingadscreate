"use client";
import { useEffect } from "react";
export default function LogoutPage() {
  useEffect(() => {
    try {
      const KEY = "cswa-create-v6";
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        localStorage.setItem(KEY, JSON.stringify({ ...p, userEmail: null }));
      }
    } catch {}
    window.location.replace("/login");
  }, []);
  return <p className="text-sm">Signing out…</p>;
}
