"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

export default function FdaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [val, setVal] = useState("64-2-3-2-0001234");
  const [result, setResult] = useState<null | { ok: boolean; text: string }>(null);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [supabase]);

  function check() {
    const match = products.find((p) => p.fda_no === val.trim());
    const validFormat = /^\d{2}-\d-\d-\d-\d{7}$/.test(val.trim());
    if (match || validFormat) {
      setResult({
        ok: true,
        text: match ? "สินค้า: " + match.name : "เลขทะเบียนถูกต้องตามรูปแบบ อย.",
      });
    } else {
      setResult({ ok: false, text: "ไม่พบในฐานข้อมูล — โปรดตรวจสอบเลขทะเบียน" });
    }
  }

  return (
    <div>
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="font-semibold">ตรวจสอบ อย.</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 text-sm">🔎 ตรวจสอบทะเบียน อย.</h3>
          <p className="text-xs text-gray-500">
            ตรวจเลขทะเบียนสินค้ากับฐานข้อมูล อย.
          </p>
          <div className="flex gap-2">
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              aria-label="เลขทะเบียน อย."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm mono focus:outline-none focus:border-mint"
            />
            <button
              type="button"
              onClick={check}
              className="bg-petrol text-white text-xs font-medium px-4 rounded-xl"
            >
              ตรวจสอบ
            </button>
          </div>
          {result && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                result.ok ? "bg-mint-soft text-teal-800" : "bg-signal-soft text-red-700"
              }`}
            >
              <span>{result.ok ? "✅" : "⚠️"}</span>
              <span>{result.text}</span>
            </div>
          )}
          <p className="text-[11px] text-amber">
            * ตอนนี้ตรวจกับข้อมูลในระบบ (mock) — การต่อ API จริงจาก data.go.th อยู่ใน Phase ถัดไป
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-2">📦 แจ้งเตือนวัสดุใกล้หมด</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
              <div className="min-w-0 pr-2">
                <p className="text-sm font-semibold text-gray-800 truncate">ยางจัดฟัน O-Ring</p>
                <p className="text-xs text-signal">เหลือ 2 แพ็คสุดท้าย</p>
              </div>
              <span className="text-[10px] bg-signal-soft text-signal font-semibold px-2 py-1 rounded-full flex-none">
                ใกล้หมด
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-sm font-semibold text-gray-800 truncate">Composite Resin A2</p>
                <p className="text-xs text-amber">ใกล้หมดอายุ (Exp 10/2026)</p>
              </div>
              <span className="text-[10px] bg-amber-soft text-amber font-semibold px-2 py-1 rounded-full flex-none">
                เตือน
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">* จะเชื่อมข้อมูลสต็อกจริงใน Phase ถัดไป</p>
        </div>
      </main>
    </div>
  );
}
