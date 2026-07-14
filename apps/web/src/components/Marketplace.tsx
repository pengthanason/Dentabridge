"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedCartOnce } from "@/lib/cart";
import { useLineProfile } from "@/lib/liff";
import { useWishlist, toggleWish } from "@/lib/wishlist";
import { ratingFor } from "@/lib/reviews";
import ProductImage from "@/components/ProductImage";
import Stars from "@/components/Stars";
import { IconHeart, IconChat } from "@/components/Icons";
import type { Product, Category } from "@/lib/types";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");
type Sort = "popular" | "price-asc" | "price-desc" | "rating";

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
  const [sort, setSort] = useState<Sort>("popular");
  const wishlist = useWishlist();
  const { profile: lineProfile } = useLineProfile();

  useEffect(() => {
    seedCartOnce(products.slice(0, 2).map((p) => p.id));
  }, [products]);

  let list = products.filter(
    (p) =>
      (catId === null || p.category_id === catId) &&
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand ?? "").toLowerCase().includes(search.toLowerCase()))
  );
  list = [...list].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return ratingFor(b.name).rating - ratingFor(a.name).rating;
    return 0; // popular = ตามลำดับเดิม
  });

  return (
    <>
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md lg:max-w-6xl mx-auto px-4 py-2.5">
          {/* แถวบน: แบรนด์ + ไอคอน */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-mint grid place-items-center font-bold text-petrol-ink text-xs mono flex-none">
                DB
              </div>
              <span className="font-bold tracking-tight truncate">DentaBridge</span>
            </div>
            <Link href="/buyer/wishlist" className="relative flex flex-col items-center justify-center px-1 flex-none text-white" aria-label="รายการโปรด">
              <IconHeart className="w-5 h-5" />
              <span className="text-[9px] leading-none mt-0.5 whitespace-nowrap">รายการโปรด</span>
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-1 bg-signal text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link href="/buyer/chat" className="relative flex flex-col items-center justify-center w-11 flex-none text-white" aria-label="แชท">
              <IconChat className="w-5 h-5" />
              <span className="text-[9px] leading-none mt-0.5">แชท</span>
              <span className="absolute top-0 right-1 bg-signal text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">
                2
              </span>
            </Link>
          </div>
          {/* แถวล่าง: ค้นหา */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า / ยี่ห้อ..."
            className="mt-2 w-full bg-white/10 placeholder:text-white/60 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white/20"
          />
        </div>
      </header>

      <main className="max-w-md lg:max-w-6xl mx-auto px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-mint-soft grid place-items-center text-xl flex-none overflow-hidden">
            {lineProfile?.pictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lineProfile.pictureUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              "🦷"
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-400 mono uppercase">Marketplace</p>
            <h2 className="font-bold text-gray-900 truncate">{lineProfile?.displayName ?? fullName}</h2>
            {clinic && <p className="text-xs text-gray-500 truncate">{clinic}</p>}
          </div>
        </div>

        {/* หมวดหมู่ */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <Chip active={catId === null} onClick={() => setCatId(null)}>ทั้งหมด</Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={catId === c.id} onClick={() => setCatId(c.id)}>{c.name_th}</Chip>
          ))}
        </div>

        {/* ตัวกรอง + เรียงลำดับ */}
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="เรียงลำดับ"
            className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="popular">ยอดนิยม</option>
            <option value="price-asc">ราคา: น้อย → มาก</option>
            <option value="price-desc">ราคา: มาก → น้อย</option>
            <option value="rating">คะแนนสูงสุด</option>
          </select>
          <span className="text-[11px] text-gray-400 ml-auto">{list.length} รายการ</span>
        </div>

        <div key={`${catId}-${sort}`} className="animate-fade">
        {list.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">ไม่พบสินค้า</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {list.map((p) => {
              const r = ratingFor(p.name);
              const wished = wishlist.includes(p.id);
              return (
                <Link
                  key={p.id}
                  href={`/buyer/product/${p.id}`}
                  className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col active:scale-[0.98] transition"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWish(p.id);
                    }}
                    className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 grid place-items-center shadow ${
                      wished ? "text-signal" : "text-gray-400"
                    }`}
                    aria-label={wished ? "เอาออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
                  >
                    <IconHeart filled={wished} className="w-4 h-4" />
                  </button>
                  <ProductImage name={p.name} imageUrl={p.image_url} emoji={p.image_emoji} className="h-24" />
                  <div className="p-3 flex flex-col flex-1">
                    {p.fda_verified && (
                      <span className="text-[9px] mono text-teal-700 bg-mint-soft w-fit px-1.5 py-0.5 rounded mb-1">
                        ✓ อย. verified
                      </span>
                    )}
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
        </div>
      </main>
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
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
