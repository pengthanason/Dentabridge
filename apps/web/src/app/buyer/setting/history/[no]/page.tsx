import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_ORDERS, orderTotal, money, toneCls } from "@/lib/mockOrders";
import ReorderButton from "@/components/ReorderButton";
import AppHeader from "@/components/AppHeader";

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
      <AppHeader title={order.no} back />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* ข้อมูลออเดอร์ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Status</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${toneCls[order.tone]}`}>
              {order.status}
            </span>
          </div>
          <Row label="Order date" value={order.date} />
          <Row label="Seller" value={order.seller} />
          <Row label="Paid via" value={order.payment} />
          <Row label="Ship to" value={order.address} />
        </div>

        {/* รายการสินค้า */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] mono uppercase text-gray-400 mb-2">Items</p>
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
            <Row label="Subtotal (before VAT)" value={money(sub)} />
            <Row label="VAT 7%" value={money(vat)} />
            <div className="flex justify-between font-bold text-petrol">
              <span>Total</span>
              <span className="mono">{money(sub + vat)}</span>
            </div>
          </div>
        </div>

        {/* สถานะจัดส่ง (ตัวอย่าง) */}
        {order.tone === "ship" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[10px] mono uppercase text-gray-400 mb-2">Delivery status</p>
            <div className="space-y-2 text-sm">
              <Step done label="Order received" />
              <Step done label="Seller preparing parcel" />
              <Step active label="Shipping — arrives tomorrow" />
              <Step label="Delivered" />
            </div>
          </div>
        )}

        {order.tone !== "cancel" && (
          <Link
            href={`/buyer/receive/${order.no}`}
            className="block w-full text-center bg-mint text-petrol-ink font-semibold text-sm py-3 rounded-xl"
          >
            📷 Inspect on receipt (Safety Net)
          </Link>
        )}

        <ReorderButton items={order.items} />

        <Link
          href="/buyer/setting/history"
          className="block text-center text-mint font-semibold text-sm py-2"
        >
          ‹ Back to history
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
