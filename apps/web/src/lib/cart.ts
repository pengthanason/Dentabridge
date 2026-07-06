"use client";

import { useEffect, useState } from "react";

// ตะกร้าเก็บใน localStorage เพื่อให้ข้ามหน้า (route) ได้ — mock ก่อน (Phase 2 จะผูก DB)
export type CartMap = Record<string, number>;
const KEY = "db_cart";
const SEEDED = "db_cart_seeded";

export function getCart(): CartMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveCart(c: CartMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new Event("db-cart-changed"));
}

export function addToCart(id: string, qty = 1) {
  const c = getCart();
  c[id] = (c[id] || 0) + qty;
  saveCart(c);
}

export function setQty(id: string, qty: number) {
  const c = getCart();
  if (qty <= 0) delete c[id];
  else c[id] = qty;
  saveCart(c);
}

export function clearCart() {
  saveCart({});
}

export function cartCount(c: CartMap) {
  return Object.values(c).reduce((a, b) => a + b, 0);
}

// ใส่ของตัวอย่าง 2 ชิ้นครั้งแรกที่เข้า (ให้เห็นตะกร้ามีของตอนนำเสนอ)
export function seedCartOnce(ids: string[]) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEEDED)) return;
  localStorage.setItem(SEEDED, "1");
  const c: CartMap = {};
  if (ids[0]) c[ids[0]] = 1;
  if (ids[1]) c[ids[1]] = 2;
  saveCart(c);
}

// hook: อ่านตะกร้าแบบ reactive (อัปเดตเมื่อมีการเปลี่ยน)
export function useCart(): CartMap {
  const [cart, setCart] = useState<CartMap>({});
  useEffect(() => {
    setCart(getCart());
    const h = () => setCart(getCart());
    window.addEventListener("db-cart-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("db-cart-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return cart;
}
