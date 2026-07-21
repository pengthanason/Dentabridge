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
import { IconHeart } from "@/components/Icons";
import AppHeader from "@/components/AppHeader";
import { VerifiedBadge } from "@/components/ui/Badge";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";


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
  const eta = km == null ? "1-2 days" : km < 10 ? "Today" : km < 100 ? "Tomorrow" : "2-3 days";
  const seller = sellerFromBrand(product.brand);

  function showToast(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 2000);
  }

  function submitOffer(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(offerPrice);
    if (!price || price <= 0) return showToast("Please enter your desired price");
    addOffer({ productId: product.id, productName: product.name, price, qty: offerQty });
    setShowOffer(false);
    showToast("Offer submitted, awaiting seller response");
  }

  return (
    <div className="pb-28">
      <AppHeader title="Product Details" back />

      <main className="max-w-md lg:max-w-4xl mx-auto">
        <ProductImage name={product.name} imageUrl={product.image_url} emoji={product.image_emoji} className="h-56 w-full" />

        <div className="px-4 py-4 space-y-4">
          <div>
            {product.fda_verified ? (
              <VerifiedBadge label="FDA verified" />
            ) : (
              <span className="text-[10px] font-semibold text-amber bg-amber-soft px-2 py-0.5 rounded-full">⚠ Unverified</span>
            )}
            <h2 className="text-lg font-bold text-gray-900 mt-2">{product.name}</h2>
            <p className="text-xs text-gray-500">
              {product.brand}
              {categoryName ? ` · Category ${categoryName}` : ""}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Stars rating={rate.rating} />
              <span className="text-xs text-gray-500">
                {rate.rating} · {rate.count} reviews
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold text-petrol mono">{money(product.price)}</p>
              <button
                type="button"
                onClick={() => toggleWish(product.id)}
                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  wished ? "border-signal text-signal bg-signal-soft" : "border-gray-200 text-gray-500"
                }`}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              >
                <IconHeart filled={wished} className="w-4 h-4" />
                {wished ? "In wishlist" : "Add to wishlist"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">{product.stock} in stock</p>
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
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-gray-900 truncate">{seller.shop}</p>
                {seller.verified && <VerifiedBadge label="Verified distributor" />}
              </div>
              <p className="text-[11px] text-gray-500">
                Seller: {seller.sellerName} · ⭐ {seller.rating}
              </p>
            </div>
            <span className="text-mint font-semibold text-xs flex-none">View store ›</span>
          </Link>

          {/* จำนวน */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-card p-4">
            <span className="text-sm font-semibold text-gray-800">Quantity</span>
            <div className="flex items-center rounded-xl border border-gray-200">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-11 grid place-items-center text-gray-500 text-lg rounded-l-xl active:bg-gray-50" aria-label="Decrease quantity">
                −
              </button>
              <span className="text-base font-bold min-w-[2.5rem] text-center mono">{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} className="w-11 h-11 grid place-items-center text-petrol text-lg rounded-r-xl active:bg-mint-soft" aria-label="Increase quantity">
                +
              </button>
            </div>
          </div>

          {/* Compliance & Specifications (medical) */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card space-y-3">
            <h3 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400">Compliance &amp; Specifications</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Spec label="FDA registration" value={product.fda_no ?? "—"} verified={product.fda_verified} />
              <Spec label="Brand" value={product.brand ?? "—"} />
              <Spec label="Model" value={product.model ?? "—"} />
              <Spec label="Country of origin" value={product.origin ?? "—"} />
            </dl>
            {product.ifu_url || product.cert_url ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {product.ifu_url && <DocLink href={product.ifu_url} label="Instructions for Use (IFU)" />}
                {product.cert_url && <DocLink href={product.cert_url} label="Certificate (CE / ISO)" />}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">Regulatory documents (IFU / Certificate) provided by the distributor on request.</p>
            )}
          </div>

          {/* สินค้าควบคุม — ต้องยืนยันใบอนุญาตก่อนซื้อ */}
          {product.controlled && (
            <div className="rounded-2xl bg-info-soft border border-info/20 text-info text-xs p-4 flex items-start gap-2.5">
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-none" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              <span className="leading-relaxed">
                <b>Controlled medical device.</b> A verified professional license is required before purchase.{" "}
                <Link href="/buyer/setting/profile" className="font-semibold underline">Verify your license</Link>
              </span>
            </div>
          )}

          {/* Request quotation (RFQ) / เสนอราคา */}
          <button
            type="button"
            onClick={() => {
              setOfferQty(qty);
              setShowOffer(true);
            }}
            className="w-full flex items-center gap-3 bg-info-soft border border-info/20 rounded-2xl p-4 text-left"
          >
            <span className="w-10 h-10 rounded-xl bg-white text-info grid place-items-center flex-none">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /><path d="M9 13h6M9 17h4" /></svg>
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold text-gray-800">Request quotation / make an offer</span>
              <span className="block text-[11px] text-gray-500">For clinic / hospital PO — propose your price &amp; quantity; the distributor will respond</span>
            </span>
            <span className="text-info font-bold">›</span>
          </button>

          {/* แผนที่ / เวลาจัดส่ง */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-mint-soft to-emerald-100">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#0000000d_1px,transparent_1px),linear-gradient(90deg,#0000000d_1px,transparent_1px)] [background-size:18px_18px]" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">📍</div>
            </div>
            <div className="p-4">
              <p className="text-[10px] mono uppercase text-gray-400">Delivery Information</p>
              <p className="text-sm text-gray-800 mt-1">
                📦 Distance from warehouse <b>{km == null ? "—" : `~${km.toFixed(1)} km`}</b> · Delivered{" "}
                <b className="text-petrol">{eta}</b>
              </p>
              <p className="text-[11px] text-amber mt-1">* Map and delivery time are illustrative (live Google Maps integration in the next phase)</p>
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] mono uppercase text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description ??
                "This product has passed FDA registration verification and annual distributor assessment, with complete certification."}
            </p>
          </div>

          {/* รีวิว */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900">Reviews ({reviews.length})</p>
              <div className="flex items-center gap-1">
                <Stars rating={rate.rating} />
                <span className="text-xs text-gray-500">{rate.rating}</span>
              </div>
            </div>

            {/* เขียนรีวิว */}
            <div className="border border-gray-100 rounded-xl p-3 mb-3">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs text-gray-500 mr-1">Rating:</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMyRating(n)}
                    className={`text-lg ${n <= myRating ? "text-amber" : "text-gray-300"}`}
                    aria-label={`${n} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={myText}
                onChange={(e) => setMyText(e.target.value)}
                placeholder="Write a review for this product..."
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint"
              />
              <button
                type="button"
                onClick={() => {
                  if (!myText.trim()) return showToast("Please write a review first");
                  addReview(product.id, myRating, myText.trim());
                  setMyText("");
                  showToast("Thank you for your review ✓");
                }}
                className="mt-2 bg-petrol text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Submit review
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
              showToast(`Added ${qty} item(s) to cart`);
            }}
            className="flex-1 border border-petrol text-petrol font-semibold text-sm py-3 rounded-xl"
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={() => {
              addToCart(product.id, qty);
              router.push("/buyer/cart");
            }}
            className="flex-1 bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
          >
            Buy now
          </button>
        </div>
      </div>

      {/* Sheet เสนอราคา */}
      {showOffer && (
        <>
          <div onClick={() => setShowOffer(false)} className="fixed inset-0 bg-black/40 z-40" aria-hidden />
          <div className="fixed inset-x-0 bottom-0 z-50 max-w-md lg:max-w-4xl mx-auto bg-white rounded-t-3xl shadow-2xl p-5 animate-sheet">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
            <form onSubmit={submitOffer} className="space-y-3">
              <div>
                <h3 className="font-bold text-gray-900">Make an offer · {product.name}</h3>
                <p className="text-[11px] text-gray-500">
                  List price {money(product.price)} — enter your desired price per unit; the seller will accept or negotiate
                </p>
              </div>
              <label className="block">
                <span className="text-[11px] text-gray-400">Offered price (per unit)</span>
                <input
                  inputMode="numeric"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value.replace(/[^\d.]/g, ""))}
                  className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm mono focus:outline-none focus:border-mint"
                />
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quantity</span>
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
                <span className="text-gray-500">Offer total</span>
                <span className="mono font-bold text-petrol">{money((Number(offerPrice) || 0) * offerQty)}</span>
              </div>
              <button type="submit" className="w-full bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition">
                Submit offer
              </button>
              <p className="text-[11px] text-gray-400 text-center">View status under Settings → My Offers</p>
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

function Spec({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-800 font-medium mono flex items-center gap-1 break-all">
        {value}
        {verified && (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-info flex-none" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        )}
      </dd>
    </div>
  );
}

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-info text-xs font-medium bg-info-soft px-2.5 py-1.5 rounded-lg">
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /></svg>
      {label}
    </a>
  );
}
