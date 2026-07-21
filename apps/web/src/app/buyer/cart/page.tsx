"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCart, setQty, clearCart } from "@/lib/cart";
import ProductImage from "@/components/ProductImage";
import AppHeader from "@/components/AppHeader";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function CartPage() {
  const supabase = useMemo(() => createClient(), []);
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => {
        setProducts((data ?? []) as Product[]);
        setLoading(false);
      });
  }, [supabase]);

  const items = Object.entries(cart)
    .map(([id, qty]) => ({ p: products.find((x) => x.id === id), qty }))
    .filter((x) => x.p) as { p: Product; qty: number }[];
  const total = items.reduce((s, x) => s + x.p.price * x.qty, 0);

  return (
    <div className="pb-40">
      <AppHeader title="Cart" />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-[3px] border-mint-soft border-t-petrol animate-spin" />
            <p className="text-xs text-gray-400">Loading cart…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🛒</div>
            <p className="text-sm text-gray-400">Your cart is empty</p>
            <Link href="/buyer" className="inline-block mt-4 text-mint font-semibold text-sm">
              Browse products ›
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(({ p, qty }) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-3 flex items-center gap-3">
                <ProductImage name={p.name} imageUrl={p.image_url} emoji={p.image_emoji} className="w-14 h-14 rounded-xl flex-none" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-sm font-bold text-petrol mono">{money(p.price)}</p>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <button type="button" onClick={() => setQty(p.id, qty - 1)} className="w-7 h-7 rounded-md border border-gray-200 text-gray-500">
                    −
                  </button>
                  <span className="text-sm font-semibold w-5 text-center">{qty}</span>
                  <button type="button" onClick={() => setQty(p.id, qty + 1)} className="w-7 h-7 rounded-md border border-gray-200 text-gray-500">
                    +
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => clearCart()} className="text-xs text-gray-400 underline">
              Clear cart
            </button>
          </div>
        )}
      </main>

      {!loading && items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-20 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Total</span>
              <span className="mono font-bold text-gray-900">{money(total)}</span>
            </div>
            <p className="text-[11px] text-teal-600 mb-2">✓ Consolidated into a single tax invoice via e-Tax</p>
            <Link
              href="/buyer/cart/pay"
              className="block text-center w-full bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
            >
              Proceed to payment · {money(total)}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
