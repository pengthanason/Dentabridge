"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

const ORYOR_URL = "https://oryor.com/check-product-serial";

export default function FdaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [products, setProducts] = useState<Product[]>([]);
  const [val, setVal] = useState("64-2-3-2-0001234");
  const [result, setResult] = useState<null | { ok: boolean; text: string }>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.from("products").select("*").then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [supabase]);

  function precheck() {
    const match = products.find((p) => p.fda_no === val.trim());
    const validFormat = /^\d{2}-\d-\d-\d-\d{7}$/.test(val.trim());
    if (match) setResult({ ok: true, text: "พบในระบบ DentaBridge: " + match.name });
    else if (validFormat) setResult({ ok: true, text: "รูปแบบเลขทะเบียนถูกต้อง — ยืนยันกับ อย. ได้ที่ปุ่มด้านล่าง" });
    else setResult({ ok: false, text: "รูปแบบเลขไม่ถูกต้อง (ตัวอย่าง 64-2-3-2-0001234)" });
  }

  function checkOnOryor() {
    // คัดลอกเลข + เปิดเว็บ อย. จริงให้ตรวจโดยตรง
    navigator.clipboard?.writeText(val.trim()).catch(() => {});
    setToast("คัดลอกเลขแล้ว — วางในช่องของเว็บ อย.");
    window.setTimeout(() => setToast(""), 2500);
    window.open(ORYOR_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="pb-6">
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="font-semibold">ตรวจสอบ อย.</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 text-sm">🔎 ตรวจสอบทะเบียน อย.</h3>
          <p className="text-xs text-gray-500">กรอกเลขทะเบียนเพื่อตรวจสอบกับฐานข้อมูล อย.</p>
          <div className="flex gap-2">
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              aria-label="เลขทะเบียน อย."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm mono focus:outline-none focus:border-mint"
            />
            <button type="button" onClick={precheck} className="bg-gray-100 text-gray-700 text-xs font-medium px-4 rounded-xl">
              เช็กรูปแบบ
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

          {/* ตรวจกับเว็บ อย. จริง */}
          <button
            type="button"
            onClick={checkOnOryor}
            className="w-full bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
          >
            ตรวจกับเว็บ อย. จริง (oryor.com) ↗
          </button>
          <p className="text-[11px] text-gray-400 text-center">
            กดแล้วระบบจะคัดลอกเลขให้ และเปิดหน้าตรวจสอบทางการของ อย. — การเชื่อม API อัตโนมัติต้องขอสิทธิ์ data-sharing จาก อย.
          </p>
        </div>
      </main>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 bg-petrol-ink text-white text-xs px-4 py-2.5 rounded-xl shadow-lg text-center">
          {toast}
        </div>
      )}
    </div>
  );
}
