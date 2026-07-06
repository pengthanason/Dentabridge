"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useWishlist, toggleWish } from "@/lib/wishlist";
import { ratingFor } from "@/lib/reviews";
import ProductImage from "@/components/ProductImage";
import Stars from "@/components/Stars";
import type { Product } from "@/lib/types";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");

export default function WishlistPage() {
  const supabase = useMemo(() => createClient(), []);
  const wishlist = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [supabase]);

  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div>
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md lg:max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1">รายการโปรด</h1>
        </div>
      </header>

      <main className="max-w-md lg:max-w-6xl mx-auto px-4 pt-4">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🤍</div>
            <p className="text-sm text-gray-400">ยังไม่มีสินค้าที่ถูกใจ</p>
            <Link href="/buyer" className="inline-block mt-4 text-mint font-semibold text-sm">
              เลือกดูสินค้า ›
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.map((p) => {
              const r = ratingFor(p.name);
              return (
                <Link
                  key={p.id}
                  href={`/buyer/product/${p.id}`}
                  className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWish(p.id);
                    }}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 grid place-items-center text-sm shadow"
                    aria-label="เอาออกจากรายการโปรด"
                  >
                    ❤️
                  </button>
                  <ProductImage name={p.name} imageUrl={p.image_url} emoji={p.image_emoji} className="h-24" />
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{p.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Stars rating={r.rating} />
                      <span className="text-[10px] text-gray-400">({r.count})</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-sm font-bold text-petrol mono">{money(p.price)}</span>
                      <span className="text-[10px] text-mint font-semibold">ดู ›</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
