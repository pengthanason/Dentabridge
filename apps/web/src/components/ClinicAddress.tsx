"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "db_delivery_address";

type Addr = {
  line: string;
  subdistrict: string;
  district: string;
  province: string;
  postal: string;
  lat: number | null;
  lng: number | null;
};

const empty: Addr = {
  line: "",
  subdistrict: "",
  district: "",
  province: "",
  postal: "",
  lat: null,
  lng: null,
};

export default function ClinicAddress({
  clinicName,
  license,
}: {
  clinicName: string;
  license: string;
}) {
  const [expand, setExpand] = useState(false);
  const [addr, setAddr] = useState<Addr>(empty);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setAddr({ ...empty, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
  }, []);

  function showToast(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 2400);
  }
  function set<K extends keyof Addr>(k: K, v: Addr[K]) {
    setAddr((a) => ({ ...a, [k]: v }));
  }

  function useGps() {
    if (!navigator.geolocation) {
      showToast("อุปกรณ์นี้ไม่รองรับ GPS");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddr((a) => ({ ...a, lat: latitude, lng: longitude }));
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=th`
          );
          const j = await r.json();
          const a = j.address || {};
          setAddr((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            line:
              [a.house_number, a.road].filter(Boolean).join(" ") ||
              (j.display_name ? String(j.display_name).split(",")[0] : ""),
            subdistrict: a.suburb || a.village || a.neighbourhood || "",
            district: a.city_district || a.county || a.town || a.district || "",
            province: a.state || a.province || a.city || "",
            postal: a.postcode || "",
          }));
          showToast("ดึงที่อยู่จาก GPS แล้ว");
        } catch {
          showToast("ได้พิกัดแล้ว — ดึงที่อยู่อัตโนมัติไม่สำเร็จ กรอกเองได้");
        }
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        showToast("เข้าถึงตำแหน่งไม่ได้ — โปรดอนุญาต Location แล้วลองใหม่");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(addr));
    showToast("บันทึกที่อยู่จัดส่งแล้ว ✓");
  }

  return (
    <div className="pb-6">
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer/setting" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1">ข้อมูลคลินิก & ที่อยู่จัดส่ง</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* คลินิก */}
        <button
          type="button"
          onClick={() => setExpand((e) => !e)}
          className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-mint-soft grid place-items-center text-xl flex-none">
              🏥
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400">คลินิกที่ลงทะเบียน</p>
              <p className="font-semibold text-gray-900 truncate">{clinicName}</p>
            </div>
            <span className="text-gray-300">{expand ? "▲" : "▼"}</span>
          </div>
          {expand && (
            <div className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-600 space-y-1">
              <p>ชื่อคลินิก: {clinicName}</p>
              <p>เลขใบอนุญาตผู้สั่งซื้อ: {license}</p>
              <p className="text-[11px] text-gray-400">
                รายละเอียดเพิ่มเติม (เวลาทำการ/ผู้ติดต่อ) จะเพิ่มในเฟสถัดไป
              </p>
            </div>
          )}
        </button>

        {/* ที่อยู่จัดส่ง */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">ที่อยู่จัดส่ง</h3>
            <button
              type="button"
              onClick={useGps}
              disabled={gpsLoading}
              className="text-xs font-semibold text-white bg-mint px-3 py-1.5 rounded-lg disabled:opacity-60"
            >
              {gpsLoading ? "กำลังหาตำแหน่ง..." : "📍 ใช้ตำแหน่งปัจจุบัน"}
            </button>
          </div>

          {/* แผนที่จำลอง เมื่อมีพิกัด */}
          {addr.lat != null && addr.lng != null && (
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <div className="relative h-28 bg-gradient-to-br from-mint-soft to-emerald-100">
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#0000000d_1px,transparent_1px),linear-gradient(90deg,#0000000d_1px,transparent_1px)] [background-size:18px_18px]" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl">
                  📍
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mono px-3 py-1.5">
                GPS {addr.lat.toFixed(5)}, {addr.lng.toFixed(5)}
              </p>
            </div>
          )}

          <Input label="ที่อยู่ (บ้านเลขที่ / ถนน)" value={addr.line} onChange={(v) => set("line", v)} />
          <div className="grid grid-cols-2 gap-2">
            <Input label="ตำบล / แขวง" value={addr.subdistrict} onChange={(v) => set("subdistrict", v)} />
            <Input label="อำเภอ / เขต" value={addr.district} onChange={(v) => set("district", v)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="จังหวัด" value={addr.province} onChange={(v) => set("province", v)} />
            <Input label="รหัสไปรษณีย์" value={addr.postal} onChange={(v) => set("postal", v)} />
          </div>

          <button
            type="button"
            onClick={save}
            className="w-full bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
          >
            บันทึกที่อยู่จัดส่ง
          </button>
          <p className="text-[11px] text-amber text-center">
            * ใช้ GPS จริงของเบราว์เซอร์ + auto-fill ที่อยู่ (บันทึกในเครื่องก่อน — ผูก DB ในเฟสถัดไป)
          </p>
        </div>
      </main>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 bg-petrol-ink text-white text-xs px-4 py-2.5 rounded-xl shadow-lg text-center">
          {toast}
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-gray-400">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-mint"
      />
    </label>
  );
}
