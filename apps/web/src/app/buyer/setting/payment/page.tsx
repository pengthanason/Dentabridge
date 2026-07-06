"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "db_payment_method";

const BANKS = [
  { id: "bank:kbank", name: "กสิกรไทย", short: "K", color: "#138f2d" },
  { id: "bank:scb", name: "ไทยพาณิชย์", short: "SCB", color: "#4e2e7f" },
  { id: "bank:bbl", name: "กรุงเทพ", short: "BBL", color: "#1e4598" },
  { id: "bank:ktb", name: "กรุงไทย", short: "KTB", color: "#01a4e9" },
  { id: "bank:bay", name: "กรุงศรีอยุธยา", short: "BAY", color: "#c69214" },
  { id: "bank:ttb", name: "ทหารไทยธนชาต", short: "ttb", color: "#003b70" },
  { id: "bank:gsb", name: "ออมสิน", short: "GSB", color: "#eb198d" },
];

export default function PaymentPage() {
  const [selected, setSelected] = useState<string>("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setSelected(localStorage.getItem(KEY) || "");
  }, []);

  function choose(id: string) {
    setSelected(id);
    localStorage.setItem(KEY, id);
    setToast("เลือกช่องทางชำระเงินแล้ว ✓");
    window.setTimeout(() => setToast(""), 1800);
  }

  return (
    <div className="pb-10">
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer/setting" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1">ช่องทางการชำระเงิน</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* พร้อมเพย์ */}
        <Section title="พร้อมเพย์ (PromptPay QR)">
          <Option
            active={selected === "promptpay"}
            onClick={() => choose("promptpay")}
            icon={<div className="w-9 h-9 rounded-lg bg-[#003d7a] text-white grid place-items-center text-xs font-bold">QR</div>}
            label="สแกน QR พร้อมเพย์"
          />
          {selected === "promptpay" && (
            <div className="mt-3 flex flex-col items-center">
              <QrMock />
              <p className="text-[11px] text-gray-400 mt-2">QR ตัวอย่าง — ระบบชำระจริงต่อในเฟสถัดไป</p>
            </div>
          )}
        </Section>

        {/* บัตรเครดิต */}
        <Section title="บัตรเครดิต / เดบิต">
          <Option
            active={selected === "visa"}
            onClick={() => choose("visa")}
            icon={<div className="w-9 h-9 rounded-lg bg-[#1a1f71] text-white grid place-items-center text-[10px] font-bold italic">VISA</div>}
            label="บัตร Visa •••• 4242"
          />
          <button type="button" className="text-xs text-mint font-semibold mt-2">
            + เพิ่มบัตรใหม่
          </button>
        </Section>

        {/* ธนาคาร */}
        <Section title="หักบัญชีธนาคาร">
          <div className="space-y-2">
            {BANKS.map((b) => (
              <Option
                key={b.id}
                active={selected === b.id}
                onClick={() => choose(b.id)}
                icon={
                  <div
                    className="w-9 h-9 rounded-lg text-white grid place-items-center text-[11px] font-bold"
                    style={{ backgroundColor: b.color }}
                  >
                    {b.short}
                  </div>
                }
                label={b.name}
              />
            ))}
          </div>
        </Section>
      </main>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-40 bg-petrol-ink text-white text-xs px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-[10px] mono uppercase text-gray-400 mb-2">{title}</p>
      {children}
    </div>
  );
}

function Option({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-2 rounded-xl border transition ${
        active ? "border-mint bg-mint-soft" : "border-gray-100"
      }`}
    >
      {icon}
      <span className="flex-1 text-left text-sm text-gray-800">{label}</span>
      <span
        className={`w-5 h-5 rounded-full border-2 grid place-items-center ${
          active ? "border-mint" : "border-gray-300"
        }`}
      >
        {active && <span className="w-2.5 h-2.5 rounded-full bg-mint" />}
      </span>
    </button>
  );
}

// QR จำลอง (ลายตาราง) — ไม่ใช้ภาพภายนอก
function QrMock() {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 7 + ((i % 5) * 3)) % 3 === 0);
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-200">
      <div className="grid grid-cols-7 gap-0.5 w-36 h-36">
        {cells.map((on, i) => (
          <div key={i} className={on ? "bg-petrol-ink rounded-[1px]" : "bg-transparent"} />
        ))}
      </div>
    </div>
  );
}
