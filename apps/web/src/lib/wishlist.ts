"use client";

import { useEffect, useState } from "react";

// รายการโปรด (wishlist) — mock เก็บใน localStorage
const KEY = "db_wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleWish(id: string) {
  const list = getWishlist();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("db-wishlist-changed"));
}

export function useWishlist(): string[] {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    setList(getWishlist());
    const h = () => setList(getWishlist());
    window.addEventListener("db-wishlist-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("db-wishlist-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return list;
}
