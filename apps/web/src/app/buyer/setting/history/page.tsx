import Link from "next/link";

const money = (n: number) => "฿" + n.toLocaleString("th-TH");

const ORDERS: {
  no: string;
  date: string;
  items: number;
  total: number;
  status: string;
  tone: "ok" | "ship" | "cancel";
}[] = [
  { no: "INV-2026-0001", date: "06/07/2026", items: 2, total: 4230, status: "กำลังจัดส่ง", tone: "ship" },
  { no: "INV-2026-0000", date: "28/06/2026", items: 5, total: 8900, status: "สำเร็จ", tone: "ok" },
  { no: "INV-2025-0092", date: "15/06/2026", items: 3, total: 2760, status: "สำเร็จ", tone: "ok" },
  { no: "INV-2025-0088", date: "02/06/2026", items: 1, total: 550, status: "ยกเลิก", tone: "cancel" },
];

const toneCls: Record<string, string> = {
  ok: "bg-mint-soft text-teal-700",
  ship: "bg-amber-soft text-amber",
  cancel: "bg-gray-100 text-gray-400",
};

export default function HistoryPage() {
  return (
    <div>
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer/setting" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1">ประวัติการซื้อ</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
        {ORDERS.map((o) => (
          <div key={o.no} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800 mono">{o.no}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${toneCls[o.tone]}`}>
                {o.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
              <span>
                {o.date} · {o.items} รายการ
              </span>
              <span className="text-petrol font-bold mono text-sm">{money(o.total)}</span>
            </div>
          </div>
        ))}
        <p className="text-center text-[11px] text-gray-400">
          * ประวัติตัวอย่าง — เชื่อมกับออเดอร์จริงในเฟสถัดไป
        </p>
      </main>
    </div>
  );
}
