"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AppHeader from "@/components/AppHeader";

const money = (n: number) => "฿" + n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

export default function TaxPage() {
  const supabase = useMemo(() => createClient(), []);
  const [info, setInfo] = useState({
    name: "—",
    taxId: "—",
    email: "—",
    phone: "—",
    clinic: "",
  });
  const [address, setAddress] = useState("—");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("email, phone")
        .eq("id", user.id)
        .single();
      const { data: b } = await supabase
        .from("buyer_profiles")
        .select("full_name, national_id, clinic_name")
        .eq("profile_id", user.id)
        .single();
      setInfo({
        name: b?.full_name ?? "—",
        taxId: b?.national_id ?? "—", // เลขบัตร ปชช. = เลขผู้เสียภาษีบุคคลธรรมดา
        email: p?.email ?? "—",
        phone: p?.phone ?? "—",
        clinic: b?.clinic_name ?? "",
      });
    })();
    try {
      const raw = localStorage.getItem("db_delivery_address");
      if (raw) {
        const a = JSON.parse(raw);
        const parts = [a.line, a.subdistrict, a.district, a.province, a.postal].filter(Boolean);
        if (parts.length) setAddress(parts.join(" "));
      }
    } catch {
      /* noop */
    }
  }, [supabase]);

  // ใบกำกับตัวอย่าง
  const items = [
    { name: "Orthodontic O-Rings (assorted colors)", qty: 1, price: 450 },
    { name: "Composite filling material A2", qty: 2, price: 1890 },
  ];
  const sub = items.reduce((s, x) => s + x.qty * x.price, 0);
  const vat = Math.round(sub * 0.07 * 100) / 100;
  const total = sub + vat;

  return (
    <div className="pb-10">
      <div className="no-print">
        <AppHeader title="Tax invoice details" back />
      </div>

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-4">
        <div className="print-area bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-petrol">DentaBridge</p>
              <p className="text-[11px] text-gray-400">Tax invoice (sample)</p>
            </div>
            <div className="text-right text-[11px] text-gray-500">
              <p>No. INV-2026-0001</p>
              <p>Date 06/07/2026</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-[10px] mono uppercase text-gray-400 mb-1">Taxpayer information</p>
            <p className="text-sm font-semibold text-gray-800">{info.name}</p>
            {info.clinic && <p className="text-xs text-gray-500">{info.clinic}</p>}
            <p className="text-xs text-gray-500">Tax ID: {info.taxId}</p>
            <p className="text-xs text-gray-500">Address: {address}</p>
            <p className="text-xs text-gray-500">
              {info.email} · {info.phone}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left font-medium pb-1">Item</th>
                  <th className="text-center font-medium pb-1">Qty</th>
                  <th className="text-right font-medium pb-1">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {items.map((it) => (
                  <tr key={it.name} className="border-t border-gray-50">
                    <td className="py-1.5">{it.name}</td>
                    <td className="text-center">{it.qty}</td>
                    <td className="text-right mono">{money(it.qty * it.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
            <Row label="Subtotal (before VAT)" value={money(sub)} />
            <Row label="VAT 7%" value={money(vat)} />
            <div className="flex justify-between font-bold text-petrol">
              <span>Grand total</span>
              <span className="mono">{money(total)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="no-print w-full bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
        >
          ⬇ Export as PDF
        </button>
        <p className="no-print text-center text-[11px] text-gray-400">
          Press Export, then choose "Save as PDF" in the print dialog
        </p>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span className="mono">{value}</span>
    </div>
  );
}
