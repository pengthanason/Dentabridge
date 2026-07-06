"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { addOffer } from "@/lib/offers";
import { sellerFromBrand } from "@/lib/sellers";
import { useWishlist, toggleWish } from "@/lib/wishlist";
import { ratingFor, useReviews, addReview } from "@/lib/reviews";
import ProductImage from "@/components/ProductImage";
import Stars from "@/components/Stars";
import type { Product } from "@/lib/types";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");

const CLINIC = { lat: 13.746, lng: 100.533 };
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export default function ProductDetail({
  product,
  categoryName,
}: {
  product: Product;
  categoryName: string;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState("");
  const [showOffer, setShowOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState(String(product.price));
  const [offerQty, setOfferQty] = useState(1);
  const [myRating, setMyRating] = useState(5);
  const [myText, setMyText] = useState("");

  const wishlist = useWishlist();
  const wished = wishlist.includes(product.id);
  const reviews = useReviews(product.id);
  const rate = ratingFor(product.name);

  const hasGeo = product.lat != null && product.lng != null;
  const km = hasGeo ? haversineKm(CLINIC, { lat: product.lat as number, lng: product.lng as number }) : null;
  const eta = km == null ? "1-2 วัน" : km < 10 ? "ภายในวันนี้" : km < 100 ? "พรุ่งนี้" : "2-3 วัน";
  const seller = sellerFromBrand(product.brand);

  function showToast(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 2000);
  }

  function submitOffer(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(offerPrice);
    if (!price || price <= 0) return showToast("กรุณาใส่ราคาที่ต้องการ");
    addOffer({ productId: product.id, productName: product.name, price, qty: offerQty });
    setShowOffer(false);
    showToast("ส่งข้อเสนอแล้ว รอผู้ขายตอบรับ");
  }

  return (
    <div className="pb-28">
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold truncate flex-1">รายละเอียดสินค้า</h1>
          <button type="button" onClick={() => toggleWish(product.id)} className="text-xl" aria-label="ถูกใจ">
            {wished ? "❤️" : "🤍"}
          </button>
        </div>
      </header>

      <main className="max-w-md lg:max-w-4xl mx-auto">
        <ProductImage name={product.name} imageUrl={product.image_url} className="h-56 w-full" />

        <div className="px-4 py-4 space-y-4">
          <div>
            {product.fda_verified && (
              <span className="text-[10px] mono text-teal-700 bg-mint-soft px-2 py-0.5 rounded">✓ อย. verified</span>
            )}
            <h2 className="text-lg font-bold text-gray-900 mt-2">{product.name}</h2>
            <p className="text-xs text-gray-500">
              {product.brand}
              {categoryName ? ` · หมวด ${categoryName}` : ""}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Stars rating={rate.rating} />
              <span className="text-xs text-gray-500">
                {rate.rating} · {rate.count} รีวิว
              </span>
            </div>
            <p className="text-2xl font-bold text-petrol mono mt-2">{money(product.price)}</p>
            <p className="text-xs text-gray-400 mt-1">คงเหลือ {product.stock} ชิ้น</p>
          </div>

          {/* ผู้ขาย */}
          <Link
            href={`/buyer/shop/${encodeURIComponent(product.brand ?? "")}`}
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="w-11 h-11 rounded-full bg-petrol text-white grid place-items-center font-bold flex-none">
              {(product.brand ?? "S").charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-bold text-gray-900 truncate">{seller.shop}</p>
                {seller.verified && (
                  <span className="text-[9px] bg-mint-soft text-teal-700 font-semibold px-1.5 py-0.5 rounded">✓</span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                ผู้ขาย: {seller.sellerName} · ⭐ {seller.rating}
              </p>
            </div>
            <span className="text-mint font-semibold text-xs flex-none">ดูร้านค้า ›</span>
          </Link>

          {/* จำนวน */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <span className="text-sm font-semibold text-gray-800">จำนวน</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 text-lg">
                −
              </button>
              <span className="text-base font-bold w-6 text-center">{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 text-lg">
                +
              </button>
            </div>
          </div>

          {/* เสนอราคา (ประมูล) */}
          <button
            type="button"
            onClick={() => {
              setOfferQty(qty);
              setShowOffer(true);
            }}
            className="w-full flex items-center gap-3 bg-amber-soft border border-amber/30 rounded-2xl p-4 text-left"
          >
            <span className="text-2xl">🤝</span>
            <span className="flex-1">
              <span className="block text-sm font-bold text-gray-800">เสนอราคาของคุณ (ประมูล)</span>
              <span className="block text-[11px] text-gray-500">ต่อรองราคากับผู้ขาย — ใส่ราคาที่ต้องการเอง</span>
            </span>
            <span className="text-amber font-bold">›</span>
          </button>

          {/* เลข อย. */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] mono uppercase text-gray-400 mb-1">ทะเบียน อย.</p>
            <p className="text-sm font-semibold text-gray-800 mono">{product.fda_no ?? "—"}</p>
          </div>

          {/* แผนที่ / เวลาจัดส่ง */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-mint-soft to-emerald-100">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#0000000d_1px,transparent_1px),linear-gradient(90deg,#0000000d_1px,transparent_1px)] [background-size:18px_18px]" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">📍</div>
            </div>
            <div className="p-4">
              <p className="text-[10px] mono uppercase text-gray-400">ข้อมูลจัดส่ง</p>
              <p className="text-sm text-gray-800 mt-1">
                📦 ระยะทางจากคลัง <b>{km == null ? "—" : `~${km.toFixed(1)} กม.`}</b> · ส่งถึง{" "}
                <b className="text-petrol">{eta}</b>
              </p>
              <p className="text-[11px] text-amber mt-1">* แผนที่/เวลาส่งเป็นตัวอย่าง (ต่อ Google Maps จริงในเฟสถัดไป)</p>
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] mono uppercase text-gray-400 mb-1">รายละเอียด</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description ??
                "สินค้าผ่านการตรวจสอบทะเบียน อย. และการประเมินผู้จัดจำหน่ายประจำปี พร้อมใบรับรองครบถ้วน"}
            </p>
          </div>

          {/* รีวิว */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900">รีวิว ({reviews.length})</p>
              <div className="flex items-center gap-1">
                <Stars rating={rate.rating} />
                <span className="text-xs text-gray-500">{rate.rating}</span>
              </div>
            </div>

            {/* เขียนรีวิว */}
            <div className="border border-gray-100 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs text-gray-500 mr-1">ให้คะแนน:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMyRating(n)}
                    className={`text-lg ${n <= myRating ? "text-amber" : "text-gray-300"}`}
                    aria-label={`${n} ดาว`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={myText}
                onChange={(e) => setMyText(e.target.value)}
                placeholder="เขียนรีวิวสินค้านี้..."
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint"
              />
              <button
                type="button"
                onClick={() => {
                  if (!myText.trim()) return showToast("กรุณาเขียนรีวิวก่อน");
                  addReview(product.id, myRating, myText.trim());
                  setMyText("");
                  showToast("ขอบคุณสำหรับรีวิว ✓");
                }}
                className="mt-2 bg-petrol text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                ส่งรีวิว
              </button>
            </div>

            {/* รายการรีวิว */}
            <div className="space-y-3">
              {reviews.map((rv) => (
                <div key={rv.id} className="border-t border-gray-50 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{rv.name}</span>
                    <span className="text-[10px] text-gray-400">{rv.date}</span>
                  </div>
                  <Stars rating={rv.rating} />
                  <p className="text-xs text-gray-600 mt-0.5">{rv.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* แถบล่าง: เพิ่มตะกร้า / ซื้อเลย */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100">
        <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              addToCart(product.id, qty);
              showToast(`เพิ่ม ${qty} ชิ้นลงตะกร้าแล้ว`);
            }}
            className="flex-1 border border-petrol text-petrol font-semibold text-sm py-3 rounded-xl"
          >
            เพิ่มลงตะกร้า
          </button>
          <button
            type="button"
            onClick={() => {
              addToCart(product.id, qty);
              router.push("/buyer/cart");
            }}
            className="flex-1 bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
          >
            ซื้อเลย
          </button>
        </div>
      </div>

      {/* Sheet เสนอราคา */}
      {showOffer && (
        <>
          <div onClick={() => setShowOffer(false)} className="fixed inset-0 bg-black/40 z-40" aria-hidden />
          <div className="fixed inset-x-0 bottom-0 z-50 max-w-md lg:max-w-4xl mx-auto bg-white rounded-t-3xl shadow-2xl p-5">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
            <form onSubmit={submitOffer} className="space-y-3">
              <div>
                <h3 className="font-bold text-gray-900">เสนอราคา · {product.name}</h3>
                <p className="text-[11px] text-gray-500">
                  ราคาตั้ง {money(product.price)} — ใส่ราคา/ชิ้นที่คุณต้องการ ผู้ขายจะตอบรับหรือต่อรอง
                </p>
              </div>
              <label className="block">
                <span className="text-[11px] text-gray-400">ราคาที่เสนอ (ต่อชิ้น)</span>
                <input
                  inputMode="numeric"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value.replace(/[^\d.]/g, ""))}
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mono focus:outline-none focus:border-mint"
                />
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">จำนวน</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setOfferQty((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500">
                    −
                  </button>
                  <span className="font-bold w-6 text-center">{offerQty}</span>
                  <button type="button" onClick={() => setOfferQty((q) => q + 1)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500">
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                <span className="text-gray-500">รวมข้อเสนอ</span>
                <span className="mono font-bold text-petrol">{money((Number(offerPrice) || 0) * offerQty)}</span>
              </div>
              <button type="submit" className="w-full bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition">
                ส่งข้อเสนอ
              </button>
              <p className="text-[11px] text-gray-400 text-center">ดูสถานะได้ที่ Setting → ข้อเสนอราคาของฉัน</p>
            </form>
          </div>
        </>
      )}

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] bg-petrol-ink text-white text-xs px-4 py-2.5 rounded-xl shadow-lg text-center">
          {toast}
        </div>
      )}
    </div>
  );
}
