"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "db_payment_method";
const CARDS_KEY = "db_cards";

const BANKS = [
  { id: "bank:kbank", name: "ธนาคารกสิกรไทย", short: "KBANK", color: "#138f2d", dark: false },
  { id: "bank:scb", name: "ธนาคารไทยพาณิชย์", short: "SCB", color: "#4e2e7f", dark: false },
  { id: "bank:bbl", name: "ธนาคารกรุงเทพ", short: "BBL", color: "#1e4598", dark: false },
  { id: "bank:ktb", name: "ธนาคารกรุงไทย", short: "KTB", color: "#01a4e9", dark: false },
  { id: "bank:bay", name: "ธนาคารกรุงศรีอยุธยา", short: "BAY", color: "#fec43b", dark: true },
  { id: "bank:ttb", name: "ธนาคารทหารไทยธนชาต", short: "ttb", color: "#003b70", dark: false },
  { id: "bank:gsb", name: "ธนาคารออมสิน", short: "GSB", color: "#eb198d", dark: false },
  { id: "bank:uob", name: "ธนาคารยูโอบี", short: "UOB", color: "#005eb8", dark: false },
];

type Card = { id: string; last4: string; name: string; exp: string; brand: string };

function detectBrand(num: string) {
  if (num.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "AMEX";
  return "บัตร";
}

export default function PaymentPage() {
  const [selected, setSelected] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [bankOpen, setBankOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");

  // ฟอร์มบัตร
  const [num, setNum] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    setSelected(localStorage.getItem(KEY) || "");
    try {
      setCards(JSON.parse(localStorage.getItem(CARDS_KEY) || "[]"));
    } catch {
      setCards([]);
    }
  }, []);

  function showToast(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 1800);
  }
  function choose(id: string) {
    setSelected(id);
    localStorage.setItem(KEY, id);
    showToast("เลือกช่องทางชำระเงินแล้ว ✓");
  }

  function saveCard(e: React.FormEvent) {
    e.preventDefault();
    const digits = num.replace(/\D/g, "");
    if (digits.length < 13) return showToast("เลขบัตรไม่ถูกต้อง");
    if (!name.trim()) return showToast("กรุณากรอกชื่อบนบัตร");
    if (!/^\d{2}\/\d{2}$/.test(exp)) return showToast("วันหมดอายุต้องเป็น MM/YY");
    if (cvv.length < 3) return showToast("CVV ไม่ถูกต้อง");

    const card: Card = {
      id: "card:" + digits.slice(-4) + ":" + cards.length,
      last4: digits.slice(-4),
      name: name.trim(),
      exp,
      brand: detectBrand(digits),
    };
    const next = [...cards, card];
    setCards(next);
    localStorage.setItem(CARDS_KEY, JSON.stringify(next));
    setNum("");
    setName("");
    setExp("");
    setCvv("");
    setShowForm(false);
    choose(card.id);
    showToast("เพิ่มบัตรแล้ว ✓");
  }

  const selectedBank = BANKS.find((b) => b.id === selected);

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
            icon={<div className="w-11 h-11 rounded-lg bg-[#003d7a] text-white grid place-items-center text-xs font-bold">QR</div>}
            label="สแกน QR พร้อมเพย์"
          />
          {selected === "promptpay" && (
            <div className="mt-3 flex flex-col items-center">
              <QrMock />
              <p className="text-[11px] text-gray-400 mt-2">QR ตัวอย่าง — ระบบชำระจริงต่อในเฟสถัดไป</p>
            </div>
          )}
        </Section>

        {/* บัตรเครดิต/เดบิต */}
        <Section title="บัตรเครดิต / เดบิต">
          <div className="space-y-2">
            {cards.map((c) => (
              <Option
                key={c.id}
                active={selected === c.id}
                onClick={() => choose(c.id)}
                icon={
                  <div className="w-11 h-11 rounded-lg bg-[#1a1f71] text-white grid place-items-center text-[9px] font-bold italic">
                    {c.brand}
                  </div>
                }
                label={`${c.brand} •••• ${c.last4}`}
                sub={c.name}
              />
            ))}
          </div>

          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-2 w-full border border-dashed border-mint text-mint font-semibold text-sm py-2.5 rounded-xl"
            >
              + เพิ่มบัตรใหม่
            </button>
          ) : (
            <form onSubmit={saveCard} className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              <CardInput
                label="เลขบัตร"
                value={num}
                onChange={(v) =>
                  setNum(
                    v
                      .replace(/\D/g, "")
                      .slice(0, 19)
                      .replace(/(.{4})/g, "$1 ")
                      .trim()
                  )
                }
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
              />
              <CardInput
                label="ชื่อบนบัตร"
                value={name}
                onChange={setName}
                placeholder="THANASON B."
              />
              <div className="grid grid-cols-2 gap-2">
                <CardInput
                  label="วันหมดอายุ (MM/YY)"
                  value={exp}
                  onChange={(v) => {
                    const d = v.replace(/\D/g, "").slice(0, 4);
                    setExp(d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d);
                  }}
                  placeholder="08/28"
                  inputMode="numeric"
                />
                <CardInput
                  label="CVV"
                  value={cvv}
                  onChange={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  inputMode="numeric"
                  type="password"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-500 text-sm py-2.5 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-petrol text-white font-semibold text-sm py-2.5 rounded-xl"
                >
                  บันทึกบัตร
                </button>
              </div>
            </form>
          )}
        </Section>

        {/* ธนาคาร (dropdown) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setBankOpen((o) => !o)}
            className="w-full flex items-center gap-3 p-4"
          >
            <div className="w-11 h-11 rounded-lg bg-mint-soft grid place-items-center text-xl flex-none">
              🏦
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-800">ธนาคาร</p>
              <p className="text-[11px] text-gray-400">
                {selectedBank ? `เลือก: ${selectedBank.name}` : "หักบัญชีธนาคาร"}
              </p>
            </div>
            <span className={`text-gray-400 transition-transform ${bankOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          {/* รายการธนาคาร — เลื่อนออกมา */}
          <div
            className="transition-all duration-300 overflow-hidden"
            style={{ maxHeight: bankOpen ? BANKS.length * 60 + 16 : 0 }}
          >
            <div className="px-3 pb-3 space-y-1.5">
              {BANKS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => choose(b.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl border transition ${
                    selected === b.id ? "border-mint bg-mint-soft" : "border-gray-100"
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-lg grid place-items-center text-[11px] font-extrabold flex-none shadow-sm"
                    style={{ backgroundColor: b.color, color: b.dark ? "#1a1a1a" : "#fff" }}
                  >
                    {b.short}
                  </div>
                  <span className="flex-1 text-left text-sm text-gray-800">{b.name}</span>
                  <span
                    className={`w-5 h-5 rounded-full border-2 grid place-items-center flex-none ${
                      selected === b.id ? "border-mint" : "border-gray-300"
                    }`}
                  >
                    {selected === b.id && <span className="w-2.5 h-2.5 rounded-full bg-mint" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-amber">
          * ข้อมูลบัตรบันทึกในเครื่อง (mock) เพื่อสาธิต — ระบบตัดเงินจริงต่อในเฟสถัดไป
        </p>
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
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub?: string;
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
      <span className="flex-1 text-left">
        <span className="block text-sm text-gray-800">{label}</span>
        {sub && <span className="block text-[11px] text-gray-400">{sub}</span>}
      </span>
      <span
        className={`w-5 h-5 rounded-full border-2 grid place-items-center flex-none ${
          active ? "border-mint" : "border-gray-300"
        }`}
      >
        {active && <span className="w-2.5 h-2.5 rounded-full bg-mint" />}
      </span>
    </button>
  );
}

function CardInput({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric";
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-gray-400">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm mono focus:outline-none focus:border-mint"
      />
    </label>
  );
}

function QrMock() {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 7 + (i % 5) * 3) % 3 === 0);
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
