"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";

type Row = {
  lcnno: string;
  nameTh: string;
  nameEn: string;
  licensee: string;
  productType: string;
  type: string;
  status: string;
  url: string;
};

export default function FdaPage() {
  return (
    <div className="pb-6">
      <AppHeader title="ตรวจสอบ อย." />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-4">
        <p className="text-[11px] text-mint text-center">✓ ดึงข้อมูลจริงจาก อย. (porta.fda.moph.go.th) ในแอป</p>

        {/* ช่อง 1: เลข อย. ทุกประเภท */}
        <FdaSearch
          type="all"
          icon="🔎"
          title="ตรวจด้วยเลข อย."
          hint="ค้นทุกประเภท (อาหาร/ยา/เครื่องสำอาง/เครื่องมือแพทย์) — อาจใช้เวลาสักครู่"
          placeholder="กรอกเลข อย."
        />

        {/* ช่อง 2: เลขจดแจ้งเครื่องมือแพทย์ */}
        <FdaSearch
          type="mdc"
          icon="🦷"
          title="ตรวจเลขจดแจ้งเครื่องมือแพทย์"
          hint="สำหรับวัสดุ/อุปกรณ์ทันตกรรม"
          placeholder="กรอกเลขจดแจ้งเครื่องมือแพทย์"
        />
      </main>
    </div>
  );
}

function FdaSearch({
  type,
  icon,
  title,
  hint,
  placeholder,
  defaultValue = "",
}: {
  type: "all" | "mdc";
  icon: string;
  title: string;
  hint: string;
  placeholder: string;
  defaultValue?: string;
}) {
  const [val, setVal] = useState(defaultValue);
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
      const res = await fetch(`/api/fda-check?type=${type}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!data.ok) throw new Error("upstream");
      setRows(data.results as Row[]);
    } catch {
      setErr("เชื่อมต่อฐานข้อมูล อย. ไม่ได้ในขณะนี้ ลองใหม่อีกครั้ง");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
      <div>
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
          <span>{icon}</span> {title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
      </div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && check()}
          placeholder={placeholder}
          aria-label={title}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-mint"
        />
        <button
          type="button"
          onClick={check}
          disabled={loading}
          className="bg-petrol hover:bg-petrol-2 disabled:opacity-60 text-white text-xs font-medium px-4 rounded-xl"
        >
          {loading ? "..." : "ตรวจ"}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-4 gap-2">
          <div className="w-7 h-7 rounded-full border-[3px] border-mint-soft border-t-petrol animate-spin" />
          <p className="text-[11px] text-gray-400">กำลังค้นจาก อย....</p>
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
          <span>ไม่พบเลขนี้ในฐานข้อมูล อย. — โปรดตรวจสอบอีกครั้ง</span>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-500">พบ {rows.length} รายการ</p>
          {rows.map((r, i) => {
            const expired = r.status.includes("หมดอายุ");
            return (
              <div key={i} className="border border-gray-100 rounded-xl p-3">
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
                <div className="mt-1.5 space-y-0.5 text-[11px] text-gray-600">
                  <p>
                    เลข: <b className="text-gray-800">{r.lcnno}</b>
                    {r.productType ? ` · ${r.productType}` : ""}
                    {r.type ? ` · ${r.type}` : ""}
                  </p>
                  {r.licensee && <p>ผู้รับอนุญาต: {r.licensee}</p>}
                </div>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1.5 text-[11px] text-mint font-semibold">
                    ดูบนเว็บ อย. ↗
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
