"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "db_payment_method";
const CARDS_KEY = "db_cards";
const BANKS_KEY = "db_bank_accounts";

const BANKS = [
  { id: "bank:kbank", name: "Kasikornbank", short: "KBANK", color: "#138f2d", dark: false },
  { id: "bank:scb", name: "SCB", short: "SCB", color: "#4e2e7f", dark: false },
  { id: "bank:bbl", name: "Bangkok Bank", short: "BBL", color: "#1e4598", dark: false },
  { id: "bank:ktb", name: "Krungthai", short: "KTB", color: "#01a4e9", dark: false },
  { id: "bank:bay", name: "Krungsri", short: "BAY", color: "#fec43b", dark: true },
  { id: "bank:ttb", name: "ttb", short: "ttb", color: "#003b70", dark: false },
  { id: "bank:gsb", name: "GSB", short: "GSB", color: "#eb198d", dark: false },
  { id: "bank:uob", name: "UOB", short: "UOB", color: "#005eb8", dark: false },
];

type Card = { id: string; last4: string; name: string; exp: string; brand: string };

function detectBrand(num: string) {
  if (num.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "AMEX";
  return "Card";
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

  // บัญชีธนาคาร
  const [bankAccounts, setBankAccounts] = useState<Record<string, { name: string; last4: string }>>({});
  const [bankForm, setBankForm] = useState<string | null>(null);
  const [acctName, setAcctName] = useState("");
  const [acctNo, setAcctNo] = useState("");

  useEffect(() => {
    setSelected(localStorage.getItem(KEY) || "");
    try {
      setCards(JSON.parse(localStorage.getItem(CARDS_KEY) || "[]"));
    } catch {
      setCards([]);
    }
    try {
      setBankAccounts(JSON.parse(localStorage.getItem(BANKS_KEY) || "{}"));
    } catch {
      setBankAccounts({});
    }
  }, []);

  function showToast(m: string) {
    setToast(m);
    window.setTimeout(() => setToast(""), 1800);
  }
  function choose(id: string) {
    setSelected(id);
    localStorage.setItem(KEY, id);
    showToast("Payment method selected ✓");
  }

  function saveCard(e: React.FormEvent) {
    e.preventDefault();
    const digits = num.replace(/\D/g, "");
    if (digits.length < 13) return showToast("Invalid card number");
    if (!name.trim()) return showToast("Please enter the name on card");
    if (!/^\d{2}\/\d{2}$/.test(exp)) return showToast("Expiry must be MM/YY");
    if (cvv.length < 3) return showToast("Invalid CVV");

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
    showToast("Card added ✓");
  }

  function openBankForm(id: string) {
    setBankForm(id);
    setAcctName(bankAccounts[id]?.name || "");
    setAcctNo("");
  }
  function saveBank(e: React.FormEvent) {
    e.preventDefault();
    if (!bankForm) return;
    if (!acctName.trim()) return showToast("Please enter the account holder name");
    const digits = acctNo.replace(/\D/g, "");
    if (digits.length < 6) return showToast("Invalid account number");
    const next = { ...bankAccounts, [bankForm]: { name: acctName.trim(), last4: digits.slice(-4) } };
    setBankAccounts(next);
    localStorage.setItem(BANKS_KEY, JSON.stringify(next));
    choose(bankForm);
    setBankForm(null);
    setAcctName("");
    setAcctNo("");
    showToast("Bank account linked ✓");
  }

  const selectedBank = BANKS.find((b) => b.id === selected);

  return (
    <div className="pb-10">
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer/setting" className="text-lg" aria-label="Back">
            ‹
          </Link>
          <h1 className="font-semibold flex-1">Payment methods</h1>
        </div>
      </header>

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* บัตรเครดิต/เดบิต */}
        <Section title="Credit / debit card">
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
              + Add new card
            </button>
          ) : (
            <form onSubmit={saveCard} className="mt-3 space-y-2 border-t border-gray-100 pt-3">
              <CardInput
                label="Card number"
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
                label="Name on card"
                value={name}
                onChange={setName}
                placeholder="THANASON BOONMAK"
              />
              <div className="grid grid-cols-2 gap-2">
                <CardInput
                  label="Expiry (MM/YY)"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-petrol text-white font-semibold text-sm py-2.5 rounded-xl"
                >
                  Save card
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
              <p className="text-sm font-semibold text-gray-800">Bank</p>
              <p className="text-[11px] text-gray-400">
                {selectedBank ? `Selected: ${selectedBank.name}` : "Direct bank debit"}
              </p>
            </div>
            <span className={`text-gray-400 transition-transform ${bankOpen ? "rotate-180" : ""}`}>▾</span>
          </button>

          {/* รายการธนาคาร — เลื่อนออกมา */}
          <div
            className="transition-all duration-300 overflow-hidden"
            style={{ maxHeight: bankOpen ? 1600 : 0 }}
          >
            <div className="px-3 pb-3 space-y-1.5">
              {BANKS.map((b) => {
                const acct = bankAccounts[b.id];
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => openBankForm(b.id)}
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
                    <span className="flex-1 text-left">
                      <span className="block text-sm text-gray-800">{b.name}</span>
                      <span className="block text-[11px] text-gray-400">
                        {acct ? `Account •••• ${acct.last4}` : "Tap to link account"}
                      </span>
                    </span>
                    <span
                      className={`w-5 h-5 rounded-full border-2 grid place-items-center flex-none ${
                        selected === b.id ? "border-mint" : "border-gray-300"
                      }`}
                    >
                      {selected === b.id && <span className="w-2.5 h-2.5 rounded-full bg-mint" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-amber">
          * Card details are stored on-device (mock) for demonstration — real payment processing will follow in a future phase
        </p>
      </main>

      {/* ฟอร์มใส่ข้อมูลบัญชีธนาคาร */}
      {bankForm &&
        (() => {
          const b = BANKS.find((x) => x.id === bankForm)!;
          return (
            <>
              <div onClick={() => setBankForm(null)} className="fixed inset-0 bg-black/40 z-40" aria-hidden />
              <div className="fixed inset-x-0 bottom-0 z-50 max-w-md lg:max-w-4xl mx-auto bg-white rounded-t-3xl shadow-2xl p-5 animate-sheet">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
                <form onSubmit={saveBank} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-9 h-9 rounded-lg grid place-items-center text-[10px] font-extrabold"
                      style={{ backgroundColor: b.color, color: b.dark ? "#1a1a1a" : "#fff" }}
                    >
                      {b.short}
                    </div>
                    <h3 className="font-bold text-gray-900">Link {b.name} account</h3>
                  </div>
                  <CardInput label="Account holder name" value={acctName} onChange={setAcctName} placeholder="Full name" />
                  <CardInput
                    label="Account number"
                    value={acctNo}
                    onChange={(v) => setAcctNo(v.replace(/\D/g, "").slice(0, 15))}
                    placeholder="xxx-x-xxxxx-x"
                    inputMode="numeric"
                  />
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setBankForm(null)} className="flex-1 border border-gray-200 text-gray-500 text-sm py-2.5 rounded-xl">
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 bg-petrol text-white font-semibold text-sm py-2.5 rounded-xl">
                      Save and use this account
                    </button>
                  </div>
                  <p className="text-[11px] text-amber text-center">
                    * Account details are stored on-device (mock) — real payment processing will follow in a future phase
                  </p>
                </form>
              </div>
            </>
          );
        })()}

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
