"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCart, setQty, clearCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");

export default function CartPage() {
  const supabase = useMemo(() => createClient(), []);
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [supabase]);

  const items = Object.entries(cart)
    .map(([id, qty]) => ({ p: products.find((x) => x.id === id), qty }))
    .filter((x) => x.p) as { p: Product; qty: number }[];
  const total = items.reduce((s, x) => s + x.p.price * x.qty, 0);

  if (placed) {
    return (
      <div className="max-w-md mx-auto px-6 pt-20 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900">สั่งซื้อสำเร็จ (ตัวอย่าง)</h2>
        <p className="text-sm text-gray-500 mt-2">
          ระบบจะรวมออกใบกำกับภาษีใบเดียวผ่าน e-Tax — ระบบชำระเงิน/บันทึกออเดอร์จริงอยู่ใน Phase ถัดไป
        </p>
        <Link
          href="/buyer"
          className="inline-block mt-6 bg-petrol text-white font-semibold text-sm px-6 py-3 rounded-xl"
        >
          กลับหน้า Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1">ตะกร้าสินค้า</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-sm text-gray-400">ยังไม่มีสินค้าในตะกร้า</p>
            <Link
              href="/buyer"
              className="inline-block mt-4 text-mint font-semibold text-sm"
            >
              เลือกซื้อสินค้า ›
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(({ p, qty }) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3"
              >
                <div className="w-14 h-14 rounded-xl bg-mint-soft grid place-items-center text-2xl flex-none">
                  {p.image_emoji ?? "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-sm font-bold text-petrol mono">{money(p.price)}</p>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <button
                    type="button"
                    onClick={() => setQty(p.id, qty - 1)}
                    className="w-7 h-7 rounded-md border border-gray-200 text-gray-500"
                  >
                    −
                  </button>
                  <span className="text-sm font-semibold w-5 text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(p.id, qty + 1)}
                    className="w-7 h-7 rounded-md border border-gray-200 text-gray-500"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => clearCart()}
              className="text-xs text-gray-400 underline"
            >
              ล้างตะกร้า
            </button>
          </div>
        )}
      </main>

      {/* แถบสรุป + ชำระเงิน (เหนือ bottom nav) */}
      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-20 bg-white border-t border-gray-100">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">ยอดรวม</span>
              <span className="mono font-bold text-gray-900">{money(total)}</span>
            </div>
            <p className="text-[11px] text-teal-600 mb-2">✓ รวมออกใบกำกับภาษีใบเดียวผ่าน e-Tax</p>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setPlaced(true);
              }}
              className="w-full bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
            >
              ดำเนินการชำระเงิน · {money(total)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
