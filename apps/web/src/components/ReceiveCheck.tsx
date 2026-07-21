"use client";

import { useState } from "react";
import Link from "next/link";

type Item = {
  name: string;
  ordered: number;
  received: number;
  status: "ok" | "warn" | "miss";
  lot: string;
  exp: string;
  note: string;
};

// สร้างสถานะตรวจรับ (mock) จากรายการในออเดอร์: ส่วนใหญ่ผ่าน, 1 ใกล้หมดอายุ, ตัวสุดท้ายขาด
function buildRows(items: { name: string; qty: number }[]): Item[] {
  return items.map((it, i, arr) => {
    const last = i === arr.length - 1 && arr.length > 1;
    const warn = i === arr.length - 2 && arr.length > 2;
    return {
      name: it.name,
      ordered: it.qty,
      received: last ? 0 : it.qty,
      status: last ? "miss" : warn ? "warn" : "ok",
      lot: "L" + (2400 + i * 37),
      exp: warn ? "01/2026" : "0" + ((i % 8) + 1) + "/2027",
      note: last
        ? "Not shipped / missing"
        : warn
        ? "FDA passed · but nearing expiry"
        : "FDA passed · matches order",
    };
  });
}

const STYLE = {
  ok: { border: "border-l-teal-600", icon: "✓", chip: "bg-mint-soft text-teal-700" },
  warn: { border: "border-l-amber", icon: "!", chip: "bg-amber-soft text-amber" },
  miss: { border: "border-l-signal", icon: "✕", chip: "bg-signal-soft text-signal" },
};

export default function ReceiveCheck({
  orderNo,
  seller,
  items,
}: {
  orderNo: string;
  seller: string;
  items: { name: string; qty: number }[];
}) {
  const rows = buildRows(items);
  const total = rows.length;
  const [scanned, setScanned] = useState(0);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState("");

  const problems = rows.filter((r) => r.status !== "ok").length;

  function showToast(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 2000);
  }

  if (done) {
    return (
      <main className="max-w-md lg:max-w-2xl mx-auto px-6 pt-16 text-center animate-fade">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900">Receipt confirmed</h2>
        <p className="text-sm text-gray-500 mt-2">
          The inspection results for order {orderNo} have been recorded
          {problems > 0 && " · Items with issues have been reported to the seller"}
        </p>
        <Link
          href="/buyer/setting/history"
          className="inline-block mt-6 bg-petrol text-white font-semibold text-sm px-6 py-3 rounded-xl"
        >
          Back to order history
        </Link>
      </main>
    );
  }

  return (
    <div className="pb-40">
      {/* แถบสแกน */}
      <div className="bg-petrol-2 text-white">
        <div className="max-w-md lg:max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-mint grid place-items-center flex-none">📷</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">Scan the box/label to receive</p>
            <p className="text-[11px] text-teal-200">Order {orderNo} · {seller}</p>
          </div>
          <span className="mono text-xs bg-white/15 px-2.5 py-1 rounded-full flex-none">{scanned}/{total}</span>
        </div>
      </div>

      <main className="max-w-md lg:max-w-2xl mx-auto px-4 pt-4 space-y-2.5">
        {rows.map((r, i) => {
          const revealed = i < scanned;
          const s = STYLE[r.status];
          return (
            <div
              key={i}
              className={`bg-white rounded-xl border border-gray-100 shadow-sm p-3 border-l-4 ${
                revealed ? s.border : "border-l-gray-200 opacity-60"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base flex-none w-5 text-center">
                  {revealed ? (r.status === "ok" ? "✅" : r.status === "warn" ? "⚠️" : "❌") : "○"}
                </span>
                <span className="font-semibold text-sm text-gray-800 leading-snug">{r.name}</span>
                <span className="ml-auto mono text-[11px] text-gray-400 flex-none whitespace-nowrap">
                  {r.received}/{r.ordered} units
                </span>
              </div>
              {revealed ? (
                <>
                  <div className="flex gap-1.5 flex-wrap mt-2 pl-7">
                    <span className={`text-[9px] mono font-semibold px-2 py-0.5 rounded ${s.chip}`}>{r.note}</span>
                    {r.status !== "miss" && (
                      <>
                        <span className="text-[9px] mono px-2 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100">{r.lot}</span>
                        <span className="text-[9px] mono px-2 py-0.5 rounded bg-gray-50 text-gray-500 border border-gray-100">EXP {r.exp}</span>
                      </>
                    )}
                  </div>
                  {r.status !== "ok" && (
                    <div className="pl-7 mt-2">
                      <button
                        type="button"
                        onClick={() => showToast(r.status === "miss" ? "Reported to seller: missing item — requesting additional shipment" : "Reported to seller: requesting lot replacement/return")}
                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border ${
                          r.status === "miss" ? "border-signal/40 text-signal" : "border-amber/40 text-amber"
                        }`}
                      >
                        {r.status === "miss" ? "Report missing / reorder" : "Report replacement / return lot"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[11px] text-gray-400 pl-7 mt-1">Awaiting scan…</p>
              )}
            </div>
          );
        })}

        <p className="text-center text-[11px] text-amber pt-1">
          * Receiving inspection (safety net) — Demo: tap “Scan” to simulate inspecting each item
        </p>
      </main>

      {/* แถบล่าง */}
      <div className="fixed bottom-16 left-0 right-0 z-20 bg-white border-t border-gray-100">
        <div className="max-w-md lg:max-w-2xl mx-auto px-4 py-3">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-500">Inspected <b className="text-gray-800">{scanned}/{total}</b> items</span>
            {scanned === total && (
              <span className={problems ? "text-signal font-semibold" : "text-teal-700 font-semibold"}>
                {problems ? `${problems} item(s) with issues` : "All items complete"}
              </span>
            )}
          </div>
          {scanned < total ? (
            <button
              type="button"
              onClick={() => setScanned((s) => Math.min(total, s + 1))}
              className="w-full bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
            >
              📷 Scan product ({scanned}/{total})
            </button>
          ) : (
            <div className="flex gap-2">
              {problems > 0 && (
                <button
                  type="button"
                  onClick={() => showToast("Issue report sent to the seller")}
                  className="flex-1 border border-signal/40 text-signal font-semibold text-sm py-3 rounded-xl"
                >
                  Report issue
                </button>
              )}
              <button
                type="button"
                onClick={() => setDone(true)}
                className="flex-1 bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
              >
                Confirm receipt
              </button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-32 z-40 bg-petrol-ink text-white text-xs px-4 py-2.5 rounded-xl shadow-lg text-center">
          {toast}
        </div>
      )}
    </div>
  );
}
