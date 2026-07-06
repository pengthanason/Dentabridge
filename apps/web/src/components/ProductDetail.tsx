"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import ProductImage from "@/components/ProductImage";
import type { Product } from "@/lib/types";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");

// พิกัดคลินิกอ้างอิง (mock) — ใจกลางกรุงเทพฯ
const CLINIC = { lat: 13.746, lng: 100.533 };

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
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
  const [toast, setToast] = useState("");

  const hasGeo = product.lat != null && product.lng != null;
  const km = hasGeo
    ? haversineKm(CLINIC, { lat: product.lat as number, lng: product.lng as number })
    : null;
  // ประเมินเวลาส่ง (mock): < 10 กม. วันนี้, < 100 พรุ่งนี้, ไกลกว่านั้น 2-3 วัน
  const eta =
    km == null ? "1-2 วัน" : km < 10 ? "ภายในวันนี้" : km < 100 ? "พรุ่งนี้" : "2-3 วัน";

  function showToast(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 1800);
  }

  return (
    <div className="pb-24">
      {/* header */}
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold truncate flex-1">รายละเอียดสินค้า</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* รูป */}
        <ProductImage name={product.name} className="h-56" />

        <div className="px-4 py-4 space-y-4">
          <div>
            {product.fda_verified && (
              <span className="text-[10px] mono text-teal-700 bg-mint-soft px-2 py-0.5 rounded">
                ✓ อย. verified
              </span>
            )}
            <h2 className="text-lg font-bold text-gray-900 mt-2">{product.name}</h2>
            <p className="text-xs text-gray-500">
              {product.brand}
              {categoryName ? ` · หมวด ${categoryName}` : ""}
            </p>
            <p className="text-2xl font-bold text-petrol mono mt-2">{money(product.price)}</p>
            <p className="text-xs text-gray-400 mt-1">คงเหลือ {product.stock} ชิ้น</p>
          </div>

          {/* เลข อย. */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] mono uppercase text-gray-400 mb-1">ทะเบียน อย.</p>
            <p className="text-sm font-semibold text-gray-800 mono">
              {product.fda_no ?? "—"}
            </p>
          </div>

          {/* แผนที่ / เวลาจัดส่ง (mock) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-mint-soft to-emerald-100">
              {/* หมุดจำลอง */}
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#0000000d_1px,transparent_1px),linear-gradient(90deg,#0000000d_1px,transparent_1px)] [background-size:18px_18px]" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">
                📍
              </div>
            </div>
            <div className="p-4">
              <p className="text-[10px] mono uppercase text-gray-400">ข้อมูลจัดส่ง</p>
              <p className="text-sm text-gray-800 mt-1">
                📦 ระยะทางจากคลัง{" "}
                <b>{km == null ? "—" : `~${km.toFixed(1)} กม.`}</b> · ส่งถึง{" "}
                <b className="text-petrol">{eta}</b>
              </p>
              {hasGeo && (
                <p className="text-[11px] text-gray-400 mono mt-1">
                  GPS {product.lat?.toFixed(4)}, {product.lng?.toFixed(4)}
                </p>
              )}
              <p className="text-[11px] text-amber mt-1">
                * แผนที่/เวลาส่งเป็นตัวอย่าง (ต่อ Google Maps จริงใน Phase ถัดไป)
              </p>
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
        </div>
      </main>

      {/* แถบล่าง: เพิ่มตะกร้า / ซื้อเลย */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto px-4 py-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              addToCart(product.id);
              showToast("เพิ่มลงตะกร้าแล้ว");
            }}
            className="flex-1 border border-petrol text-petrol font-semibold text-sm py-3 rounded-xl"
          >
            เพิ่มลงตะกร้า
          </button>
          <button
            type="button"
            onClick={() => {
              addToCart(product.id);
              router.push("/buyer/cart");
            }}
            className="flex-1 bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
          >
            ซื้อเลย
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 bg-petrol-ink text-white text-xs px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
