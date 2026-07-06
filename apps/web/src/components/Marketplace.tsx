"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedCartOnce } from "@/lib/cart";
import type { Product, Category } from "@/lib/types";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");

export default function Marketplace({
  fullName,
  clinic,
  products,
  categories,
}: {
  fullName: string;
  clinic: string;
  products: Product[];
  categories: Category[];
}) {
  const [search, setSearch] = useState("");
  const [catId, setCatId] = useState<number | null>(null);

  // ใส่ของตัวอย่างในตะกร้าครั้งแรก
  useEffect(() => {
    seedCartOnce(products.slice(0, 2).map((p) => p.id));
  }, [products]);

  const filtered = products.filter(
    (p) =>
      (catId === null || p.category_id === catId) &&
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      {/* Top bar */}
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า / ยี่ห้อ..."
            className="flex-1 bg-white/10 placeholder:text-white/60 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white/20"
          />
          <Link href="/buyer/chat" className="relative w-9 h-9 grid place-items-center" aria-label="แชท">
            💬
            <span className="absolute -top-1 -right-1 bg-signal text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">
              2
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 mono uppercase">Marketplace</p>
          <h2 className="font-bold text-gray-900">{fullName}</h2>
          {clinic && <p className="text-xs text-gray-500">{clinic}</p>}
        </div>

        {/* หมวดหมู่ */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <Chip active={catId === null} onClick={() => setCatId(null)}>
            ทั้งหมด
          </Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={catId === c.id} onClick={() => setCatId(c.id)}>
              {c.name_th}
            </Chip>
          ))}
        </div>

        {/* ฟีดสินค้า — กดเข้า detail ได้ */}
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">ไม่พบสินค้า</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/buyer/product/${p.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col active:scale-[0.98] transition"
              >
                <div className="h-24 bg-mint-soft grid place-items-center text-4xl">
                  {p.image_emoji ?? "📦"}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  {p.fda_verified && (
                    <span className="text-[9px] mono text-teal-700 bg-mint-soft w-fit px-1.5 py-0.5 rounded mb-1">
                      ✓ อย. verified
                    </span>
                  )}
                  <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{p.brand}</p>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-sm font-bold text-petrol mono">{money(p.price)}</span>
                    <span className="text-[10px] text-mint font-semibold">ดูสินค้า ›</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-none text-xs px-3 py-1.5 rounded-full border transition ${
        active ? "bg-petrol text-white border-petrol" : "bg-white text-gray-600 border-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
