"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart, clearCart } from "@/lib/cart";
import { findCoupon, discountOf, type Coupon } from "@/lib/coupons";
import type { Product } from "@/lib/types";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");
const BANK_LABEL: Record<string, string> = {
  kbank: "กสิกรไทย", scb: "ไทยพาณิชย์", bbl: "กรุงเทพ", ktb: "กรุงไทย",
  bay: "กรุงศรีอยุธยา", ttb: "ทหารไทยธนชาต", gsb: "ออมสิน", uob: "ยูโอบี",
};
type Card = { id: string; last4: string; brand: string };
type Method = { id: string; label: string; icon: React.ReactNode };

export default function PayPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [payMethod, setPayMethod] = useState("promptpay");
  const [codeInput, setCodeInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponErr, setCouponErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from("products").select("*").then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [supabase]);

  useEffect(() => {
    const list: Method[] = [
      { id: "promptpay", label: "พร้อมเพย์ (QR)", icon: <Tile className="bg-[#003d7a] text-white text-[9px]">QR</Tile> },
    ];
    try {
      const cards: Card[] = JSON.parse(localStorage.getItem("db_cards") || "[]");
      cards.forEach((c) =>
        list.push({ id: c.id, label: `${c.brand} •••• ${c.last4}`, icon: <Tile className="bg-[#1a1f71] text-white text-[8px] italic">{c.brand}</Tile> })
      );
      const sel = localStorage.getItem("db_payment_method") || "";
      if (sel.startsWith("bank:")) {
        list.push({ id: sel, label: `ธนาคาร${BANK_LABEL[sel.slice(5)] ?? ""}`, icon: <Tile className="bg-mint-soft">🏦</Tile> });
      }
      if (sel && list.some((m) => m.id === sel)) setPayMethod(sel);
    } catch {
      /* noop */
    }
    setMethods(list);
  }, []);

  const items = Object.entries(cart)
    .map(([id, qty]) => ({ p: products.find((x) => x.id === id), qty }))
    .filter((x) => x.p) as { p: Product; qty: number }[];
  const subtotal = items.reduce((s, x) => s + x.p.price * x.qty, 0);
  const discount = coupon ? discountOf(coupon, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  function applyCoupon() {
    setCouponErr("");
    const c = findCoupon(codeInput);
    if (!c) return setCouponErr("ไม่พบคูปองนี้");
    if (subtotal < c.minSpend) return setCouponErr(`ต้องซื้อขั้นต่ำ ${money(c.minSpend)}`);
    setCoupon(c);
  }

  if (done) {
    return (
      <div className="max-w-md lg:max-w-4xl mx-auto px-6 pt-20 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900">ชำระเงินสำเร็จ (ตัวอย่าง)</h2>
        <p className="text-sm text-gray-500 mt-2">
          ยอดชำระ {money(total)} · รวมออกใบกำกับภาษีใบเดียวผ่าน e-Tax
        </p>
        <Link href="/buyer" className="inline-block mt-6 bg-petrol text-white font-semibold text-sm px-6 py-3 rounded-xl">
          กลับหน้า Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="text-lg" aria-label="กลับ">
            ‹
          </button>
          <h1 className="font-semibold flex-1">ชำระเงิน</h1>
        </div>
      </header>

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* คูปอง */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] mono uppercase text-gray-400 mb-2">คูปองส่วนลด</p>
          {coupon ? (
            <div className="flex items-center justify-between bg-mint-soft rounded-xl px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-teal-800">{coupon.code}</p>
                <p className="text-[11px] text-teal-700">{coupon.label} · −{money(discount)}</p>
              </div>
              <button type="button" onClick={() => { setCoupon(null); setCodeInput(""); }} className="text-xs text-gray-500">
                นำออก
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="กรอกโค้ดคูปอง เช่น WELCOME10"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm mono focus:outline-none focus:border-mint"
                />
                <button type="button" onClick={applyCoupon} className="bg-petrol text-white text-xs font-medium px-4 rounded-xl">
                  ใช้
                </button>
              </div>
              {couponErr && <p className="text-[11px] text-red-600 mt-1">{couponErr}</p>}
              <Link href="/buyer/setting/coupon" className="text-[11px] text-mint font-semibold mt-2 inline-block">
                ดูคูปองของฉัน ›
              </Link>
            </>
          )}
        </div>

        {/* วิธีชำระเงิน */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
          <p className="text-[10px] mono uppercase text-gray-400">วิธีชำระเงิน</p>
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPayMethod(m.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-xl border transition ${
                payMethod === m.id ? "border-mint bg-mint-soft" : "border-gray-100"
              }`}
            >
              {m.icon}
              <span className="flex-1 text-left text-sm text-gray-800">{m.label}</span>
              <span className={`w-5 h-5 rounded-full border-2 grid place-items-center flex-none ${payMethod === m.id ? "border-mint" : "border-gray-300"}`}>
                {payMethod === m.id && <span className="w-2.5 h-2.5 rounded-full bg-mint" />}
              </span>
            </button>
          ))}
          <Link href="/buyer/setting/payment" className="block text-xs text-mint font-semibold pt-1">
            + จัดการช่องทางชำระเงิน
          </Link>
        </div>

        {payMethod === "promptpay" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center">
            <p className="text-sm font-semibold text-gray-800 mb-2">สแกนเพื่อจ่าย {money(total)}</p>
            <QrMock />
            <p className="text-[11px] text-gray-400 mt-2">QR ตัวอย่าง — สแกนด้วยแอปธนาคาร</p>
          </div>
        )}

        {/* สรุปยอด */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-1 text-sm">
          <Row label="ยอดสินค้า" value={money(subtotal)} />
          {discount > 0 && <Row label="ส่วนลดคูปอง" value={`−${money(discount)}`} green />}
          <div className="flex justify-between font-bold text-petrol border-t border-gray-100 pt-1">
            <span>ยอดชำระ</span>
            <span className="mono">{money(total)}</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100">
        <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-3">
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => { clearCart(); setDone(true); }}
            className="w-full bg-petrol hover:bg-petrol-2 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition"
          >
            ยืนยันการชำระเงิน · {money(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`mono ${green ? "text-mint font-semibold" : "text-gray-800"}`}>{value}</span>
    </div>
  );
}
function Tile({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`w-11 h-11 rounded-lg grid place-items-center font-bold flex-none ${className}`}>{children}</div>;
}
function QrMock() {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 7 + (i % 5) * 3) % 3 === 0);
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-200">
      <div className="grid grid-cols-7 gap-0.5 w-40 h-40">
        {cells.map((on, i) => (
          <div key={i} className={on ? "bg-petrol-ink rounded-[1px]" : "bg-transparent"} />
        ))}
      </div>
    </div>
  );
}
