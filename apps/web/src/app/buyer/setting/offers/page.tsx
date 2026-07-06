"use client";

import Link from "next/link";
import { useOffers } from "@/lib/offers";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");
const statusCls: Record<string, string> = {
  pending: "bg-amber-soft text-amber",
  accepted: "bg-mint-soft text-teal-700",
  declined: "bg-gray-100 text-gray-400",
};
const statusLabel: Record<string, string> = {
  pending: "รอผู้ขายตอบรับ",
  accepted: "ผู้ขายรับข้อเสนอ",
  declined: "ปฏิเสธ",
};

export default function OffersPage() {
  const offers = useOffers();

  return (
    <div>
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer/setting" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1">ข้อเสนอราคาของฉัน</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
        {offers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🤝</div>
            <p className="text-sm text-gray-400">ยังไม่มีข้อเสนอราคา</p>
            <Link href="/buyer" className="inline-block mt-4 text-mint font-semibold text-sm">
              ไปเสนอราคาสินค้า ›
            </Link>
          </div>
        ) : (
          offers.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800 truncate pr-2">{o.productName}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-none ${statusCls[o.status]}`}>
                  {statusLabel[o.status]}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>
                  เสนอ {money(o.price)}/ชิ้น × {o.qty} · {o.date}
                </span>
                <span className="text-petrol font-bold mono text-sm">{money(o.price * o.qty)}</span>
              </div>
            </div>
          ))
        )}
        <p className="text-center text-[11px] text-gray-400">
          * สถานะเป็นตัวอย่าง — เชื่อมการตอบรับจากผู้ขายจริงในเฟสถัดไป
        </p>
      </main>
    </div>
  );
}
