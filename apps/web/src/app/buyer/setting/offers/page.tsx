"use client";

import Link from "next/link";
import { useOffers } from "@/lib/offers";
import AppHeader from "@/components/AppHeader";
import { money } from "@/lib/format";

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
      <AppHeader title="ข้อเสนอราคาของฉัน" back />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-3">
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
