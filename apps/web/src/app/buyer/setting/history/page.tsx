import Link from "next/link";
import { MOCK_ORDERS, orderTotal, money, toneCls } from "@/lib/mockOrders";
import AppHeader from "@/components/AppHeader";

export default function HistoryPage() {
  return (
    <div>
      <AppHeader title="Order history" back />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-3">
        {MOCK_ORDERS.map((o) => (
          <Link
            key={o.no}
            href={`/buyer/setting/history/${o.no}`}
            className="block bg-white rounded-2xl border border-gray-100 shadow-card p-4 active:scale-[0.99] transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800 mono">{o.no}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${toneCls[o.tone]}`}>
                {o.status}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
              <span>
                {o.date} · {o.items.length} items
              </span>
              <span className="text-petrol font-bold mono text-sm">{money(orderTotal(o))}</span>
            </div>
            <p className="text-[11px] text-mint font-semibold mt-1">View details ›</p>
          </Link>
        ))}
        <p className="text-center text-[11px] text-gray-400">
          * Sample history — will be connected to real orders in a future phase
        </p>
      </main>
    </div>
  );
}
