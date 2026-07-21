"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart, clearCart } from "@/lib/cart";
import { findCoupon, discountOf, type Coupon } from "@/lib/coupons";
import AppHeader from "@/components/AppHeader";
import { IconBank, IconCheckCircle } from "@/components/Icons";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";
const BANK_LABEL: Record<string, string> = {
  kbank: "Kasikorn", scb: "Siam Commercial", bbl: "Bangkok", ktb: "Krungthai",
  bay: "Krungsri", ttb: "TMBThanachart", gsb: "Government Savings", uob: "UOB",
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
  const [paying, setPaying] = useState(false);
  const [payErr, setPayErr] = useState("");

  useEffect(() => {
    supabase.from("products").select("*").then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [supabase]);

  useEffect(() => {
    const list: Method[] = [
      { id: "promptpay", label: "PromptPay (QR)", icon: <Tile className="bg-[#003d7a] text-white text-[9px]">QR</Tile> },
    ];
    try {
      const cards: Card[] = JSON.parse(localStorage.getItem("db_cards") || "[]");
      cards.forEach((c) =>
        list.push({ id: c.id, label: `${c.brand} •••• ${c.last4}`, icon: <Tile className="bg-[#1a1f71] text-white text-[8px] italic">{c.brand}</Tile> })
      );
      const sel = localStorage.getItem("db_payment_method") || "";
      if (sel.startsWith("bank:")) {
        list.push({ id: sel, label: `${BANK_LABEL[sel.slice(5)] ?? ""} Bank`, icon: <Tile className="bg-mint-soft text-petrol"><IconBank className="w-6 h-6" /></Tile> });
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
    if (!c) return setCouponErr("Coupon not found");
    if (subtotal < c.minSpend) return setCouponErr(`Minimum spend of ${money(c.minSpend)} required`);
    setCoupon(c);
  }

  async function confirmPay() {
    if (paying || items.length === 0) return; // กันกดซ้ำ
    setPayErr("");
    setPaying(true);
    try {
      // TODO(production): POST /api/orders → server คำนวณยอดใหม่จาก DB (ห้ามเชื่อ total จาก client)
      // → สร้าง charge ผ่าน gateway (Omise/GB Prime Pay) → webhook verify signature อัปเดตสถานะ 'paid'
      // ปัจจุบันเป็น mock: ห้ามใช้ในการรับเงินจริง
      await new Promise((r) => setTimeout(r, 600));
      clearCart();
      setDone(true);
    } catch {
      setPayErr("Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md lg:max-w-4xl mx-auto px-6 pt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-mint-soft text-mint grid place-items-center mx-auto mb-4">
          <IconCheckCircle className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Payment successful (demo)</h2>
        <p className="text-sm text-gray-500 mt-2">
          Amount due {money(total)} · Consolidated into a single tax invoice via e-Tax
        </p>
        <Link href="/buyer" className="inline-block mt-6 bg-petrol text-white font-semibold text-sm px-6 py-3 rounded-xl">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <AppHeader title="Payment" back />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* คูปอง */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4">
          <p className="text-[10px] mono uppercase text-gray-400 mb-2">Discount coupon</p>
          {coupon ? (
            <div className="flex items-center justify-between bg-mint-soft rounded-xl px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-teal-800">{coupon.code}</p>
                <p className="text-[11px] text-teal-700">{coupon.label} · −{money(discount)}</p>
              </div>
              <button type="button" onClick={() => { setCoupon(null); setCodeInput(""); }} className="text-xs text-gray-500">
                Remove
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code, e.g. WELCOME10"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm mono focus:outline-none focus:border-mint"
                />
                <button type="button" onClick={applyCoupon} className="bg-petrol text-white text-xs font-medium px-4 rounded-xl">
                  Apply
                </button>
              </div>
              {couponErr && <p className="text-[11px] text-red-600 mt-1">{couponErr}</p>}
              <Link href="/buyer/setting/coupon" className="text-[11px] text-mint font-semibold mt-2 inline-block">
                View my coupons ›
              </Link>
            </>
          )}
        </div>

        {/* วิธีชำระเงิน */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-2">
          <p className="text-[10px] mono uppercase text-gray-400">Payment method</p>
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
            + Manage payment methods
          </Link>
        </div>

        {payMethod === "promptpay" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex flex-col items-center">
            <p className="text-sm font-semibold text-gray-800 mb-2">Scan to pay {money(total)}</p>
            <QrMock />
            <p className="text-[11px] text-gray-400 mt-2">Sample QR — scan with your banking app</p>
          </div>
        )}

        {/* สรุปยอด */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 space-y-1 text-sm">
          <Row label="Subtotal" value={money(subtotal)} />
          {discount > 0 && <Row label="Coupon discount" value={`−${money(discount)}`} green />}
          <div className="flex justify-between font-bold text-petrol border-t border-gray-100 pt-1">
            <span>Amount due</span>
            <span className="mono">{money(total)}</span>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-3">
          {payErr && (
            <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">{payErr}</p>
          )}
          <button
            type="button"
            disabled={paying || items.length === 0}
            onClick={confirmPay}
            className="w-full bg-petrol hover:bg-petrol-2 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {paying && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
            {paying ? "Processing…" : `Confirm payment · ${money(total)}`}
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
// QR ตัวอย่าง (เดโม) — สร้างลาย finder pattern มุม + modules ให้ดูเหมือน QR จริง (deterministic กัน hydration mismatch)
function QrMock() {
  const N = 21;
  const finder = (r: number, c: number): boolean | null => {
    const box = (br: number, bc: number) => {
      const rr = r - br,
        cc = c - bc;
      if (rr < 0 || cc < 0 || rr > 6 || cc > 6) return null;
      const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6;
      const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
      return ring || core;
    };
    const a = box(0, 0);
    if (a !== null) return a;
    const b = box(0, N - 7);
    if (b !== null) return b;
    return box(N - 7, 0);
  };
  const cells: boolean[] = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const f = finder(r, c);
      cells.push(f !== null ? f : (r * 7 + c * 13 + r * c) % 3 === 0);
    }
  return (
    <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-card">
      <div className="grid gap-px w-44 h-44" style={{ gridTemplateColumns: `repeat(${N}, minmax(0,1fr))` }}>
        {cells.map((on, i) => (
          <div key={i} className={on ? "bg-petrol-ink" : "bg-transparent"} />
        ))}
      </div>
    </div>
  );
}
