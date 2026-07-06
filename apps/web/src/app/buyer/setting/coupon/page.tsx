"use client";

import { useState } from "react";
import Link from "next/link";
import { COUPONS } from "@/lib/coupons";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");

export default function CouponPage() {
  const [toast, setToast] = useState("");
  const claimed = COUPONS.filter((c) => c.claimed);
  const upcoming = COUPONS.filter((c) => !c.claimed);

  function copy(code: string) {
    navigator.clipboard?.writeText(code).catch(() => {});
    setToast(`คัดลอกโค้ด ${code} แล้ว`);
    window.setTimeout(() => setToast(""), 1800);
  }

  return (
    <div className="pb-10">
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer/setting" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1">คูปองของฉัน</h1>
        </div>
      </header>

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-4">
        <div>
          <p className="text-[10px] mono uppercase text-gray-400 mb-2">ใช้ได้เลย</p>
          <div className="space-y-3">
            {claimed.map((c) => (
              <div key={c.code} className="bg-white rounded-2xl border border-mint/40 shadow-sm overflow-hidden flex">
                <div className="w-16 bg-mint grid place-items-center text-white text-2xl flex-none">🎟️</div>
                <div className="flex-1 p-3 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{c.label}</p>
                  <p className="text-[11px] text-gray-500">{c.note} · ขั้นต่ำ {money(c.minSpend)}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs mono font-bold text-petrol bg-mint-soft px-2 py-0.5 rounded">{c.code}</span>
                    <button type="button" onClick={() => copy(c.code)} className="text-[11px] text-mint font-semibold">
                      คัดลอก
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] mono uppercase text-gray-400 mb-2">คูปองที่จะได้รับ</p>
          <div className="space-y-3">
            {upcoming.map((c) => (
              <div key={c.code} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex opacity-70">
                <div className="w-16 bg-gray-200 grid place-items-center text-gray-400 text-2xl flex-none">🔒</div>
                <div className="flex-1 p-3 min-w-0">
                  <p className="text-sm font-bold text-gray-700">{c.label}</p>
                  <p className="text-[11px] text-gray-400">{c.note} · ขั้นต่ำ {money(c.minSpend)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400">
          * คูปองตัวอย่าง — รับเมื่อทำสำเร็จบางอย่าง/วันสำคัญ (เชื่อมเงื่อนไขจริงในเฟสถัดไป)
        </p>
      </main>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 bg-petrol-ink text-white text-xs px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
