"use client";

import { useState } from "react";

type Row = {
  lcnno: string;
  nameTh: string;
  nameEn: string;
  licensee: string;
  type: string;
  status: string;
  url: string;
};

export default function FdaPage() {
  const [val, setVal] = useState("ผ.1/2559");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");

  async function check() {
    const q = val.trim();
    if (!q) return;
    setErr("");
    setRows(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/fda-check?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!data.ok) throw new Error("upstream");
      setRows(data.results as Row[]);
    } catch {
      setErr("เชื่อมต่อฐานข้อมูล อย. ไม่ได้ในขณะนี้ ลองใหม่อีกครั้ง");
    }
    setLoading(false);
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
          <h3 className="font-bold text-gray-900 text-sm">🔎 ตรวจเลขจดแจ้งเครื่องมือแพทย์</h3>
          <p className="text-xs text-gray-500">
            ตรวจกับฐานข้อมูลจริงของ อย. (porta.fda.moph.go.th) — พิมพ์เลขจดแจ้ง เช่น <b>ผ.1/2559</b>
          </p>
          <div className="flex gap-2">
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && check()}
              aria-label="เลขจดแจ้ง อย."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-mint"
            />
            <button
              type="button"
              onClick={check}
              disabled={loading}
              className="bg-petrol hover:bg-petrol-2 disabled:opacity-60 text-white text-xs font-medium px-4 rounded-xl"
            >
              {loading ? "..." : "ตรวจสอบ"}
            </button>
          </div>
          <p className="text-[11px] text-mint">✓ ดึงข้อมูลจริงจาก อย. โดยตรงในแอป</p>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-8 gap-2">
            <div className="w-8 h-8 rounded-full border-[3px] border-mint-soft border-t-petrol animate-spin" />
            <p className="text-xs text-gray-400">กำลังค้นข้อมูลจาก อย....</p>
          </div>
        )}

        {err && (
          <div className="bg-signal-soft text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
            <span>⚠️</span>
            <span>{err}</span>
          </div>
        )}

        {rows && rows.length === 0 && !loading && (
          <div className="bg-amber-soft text-amber text-xs p-3 rounded-xl flex items-start gap-2">
            <span>⚠️</span>
            <span>ไม่พบเลขจดแจ้งนี้ในฐานข้อมูล อย. — โปรดตรวจสอบเลขอีกครั้ง</span>
          </div>
        )}

        {rows && rows.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">พบ {rows.length} รายการ</p>
            {rows.map((r, i) => {
              const expired = r.status.includes("หมดอายุ");
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">{r.nameTh || r.nameEn}</p>
                      {r.nameEn && r.nameTh && <p className="text-[11px] text-gray-400">{r.nameEn}</p>}
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full flex-none ${
                        expired ? "bg-amber-soft text-amber" : "bg-mint-soft text-teal-700"
                      }`}
                    >
                      {r.status || "ขึ้นทะเบียน"}
                    </span>
                  </div>
                  <div className="mt-2 space-y-0.5 text-xs text-gray-600">
                    <p>เลขจดแจ้ง: <b className="text-gray-800">{r.lcnno}</b> · {r.type}</p>
                    <p>ผู้รับอนุญาต: {r.licensee}</p>
                  </div>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-[11px] text-mint font-semibold"
                    >
                      ดูรายละเอียดบนเว็บ อย. ↗
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
