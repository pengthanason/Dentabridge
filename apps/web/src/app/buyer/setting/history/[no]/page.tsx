import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_ORDERS, orderTotal, money, toneCls } from "@/lib/mockOrders";
import ReorderButton from "@/components/ReorderButton";

export default function OrderDetailPage({
  params,
}: {
  params: { no: string };
}) {
  const order = MOCK_ORDERS.find((o) => o.no === decodeURIComponent(params.no));
  if (!order) notFound();

  const sub = orderTotal(order);
  const vat = Math.round(sub * 0.07 * 100) / 100;

  return (
    <div>
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer/setting/history" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1 truncate mono">{order.no}</h1>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${toneCls[order.tone]}`}>
            {order.status}
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* ข้อมูลออเดอร์ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2 text-sm">
          <Row label="วันที่สั่งซื้อ" value={order.date} />
          <Row label="ผู้ขาย" value={order.seller} />
          <Row label="ชำระโดย" value={order.payment} />
          <Row label="จัดส่งที่" value={order.address} />
        </div>

        {/* รายการสินค้า */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] mono uppercase text-gray-400 mb-2">รายการสินค้า</p>
          <div className="divide-y divide-gray-50">
            {order.items.map((it) => (
              <div key={it.name} className="flex items-center justify-between py-2">
                <div className="min-w-0 pr-2">
                  <p className="text-sm text-gray-800 truncate">{it.name}</p>
                  <p className="text-[11px] text-gray-400">x{it.qty}</p>
                </div>
                <span className="text-sm font-semibold text-gray-800 mono flex-none">
                  {money(it.qty * it.price)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-2 pt-2 space-y-1 text-sm">
            <Row label="ยอดก่อน VAT" value={money(sub)} />
            <Row label="VAT 7%" value={money(vat)} />
            <div className="flex justify-between font-bold text-petrol">
              <span>ยอดรวม</span>
              <span className="mono">{money(sub + vat)}</span>
            </div>
          </div>
        </div>

        {/* สถานะจัดส่ง (ตัวอย่าง) */}
        {order.tone === "ship" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[10px] mono uppercase text-gray-400 mb-2">สถานะการจัดส่ง</p>
            <div className="space-y-2 text-sm">
              <Step done label="รับออเดอร์แล้ว" />
              <Step done label="ผู้ขายจัดเตรียมพัสดุ" />
              <Step active label="กำลังจัดส่ง — ถึงพรุ่งนี้" />
              <Step label="จัดส่งสำเร็จ" />
            </div>
          </div>
        )}

        <ReorderButton items={order.items} />

        <Link
          href="/buyer/setting/history"
          className="block text-center text-mint font-semibold text-sm py-2"
        >
          ‹ กลับไปหน้าประวัติ
        </Link>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-400 flex-none">{label}</span>
      <span className="text-gray-800 text-right">{value}</span>
    </div>
  );
}

function Step({ label, done, active }: { label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-4 h-4 rounded-full grid place-items-center text-[9px] flex-none ${
          done ? "bg-mint text-white" : active ? "bg-amber text-white" : "bg-gray-200 text-transparent"
        }`}
      >
        ✓
      </span>
      <span className={active ? "text-gray-900 font-medium" : done ? "text-gray-600" : "text-gray-400"}>
        {label}
      </span>
    </div>
  );
}
