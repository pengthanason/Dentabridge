"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChatSheet, { type ChatThread } from "@/components/ChatSheet";
import type { Product, Category } from "@/lib/types";

type Tab = "feed" | "fda" | "settings";
const money = (n: number) => "฿" + n.toLocaleString("th-TH");

// แชทจำลองฝั่งผู้ซื้อ (คุยกับผู้ขาย)
const BUYER_CHATS: ChatThread[] = [
  {
    id: "c1",
    name: "Dental Vision",
    avatar: "🏢",
    last: "ยืนยันออเดอร์แล้วค่ะ จัดส่งพรุ่งนี้",
    time: "10:24",
    messages: [
      { from: "them", text: "สวัสดีค่ะ สนใจสินค้าตัวไหนสอบถามได้เลยนะคะ" },
      { from: "me", text: "ยาง O-Ring มีสีอะไรบ้างครับ" },
      { from: "them", text: "มีครบ 8 สีเลยค่ะ สั่งขั้นต่ำ 1 แพ็ค มีใบรับรอง อย. ครบ" },
      { from: "me", text: "โอเคครับ สั่ง 2 แพ็ค" },
      { from: "them", text: "รับทราบค่ะ ยืนยันออเดอร์แล้ว จัดส่งพรุ่งนี้" },
    ],
  },
  {
    id: "c2",
    name: "MedSupply TH",
    avatar: "🏭",
    last: "ขอบคุณที่อุดหนุนค่ะ 🙏",
    time: "เมื่อวาน",
    messages: [
      { from: "me", text: "ถุงมือไนไตรล์ล็อตใหม่ Exp ปีไหนครับ" },
      { from: "them", text: "ล็อตนี้ Exp 2028 ค่ะ" },
      { from: "them", text: "ขอบคุณที่อุดหนุนค่ะ 🙏" },
    ],
  },
];

export default function BuyerHome({
  fullName,
  clinic,
  verified,
  products,
  categories,
}: {
  fullName: string;
  clinic: string;
  verified: boolean;
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("feed");
  const [search, setSearch] = useState("");
  const [catId, setCatId] = useState<number | null>(null);
  const [sheet, setSheet] = useState<"cart" | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState("");

  // เริ่มต้นมีของในตะกร้า 2 ชิ้น (ให้เห็นตัวอย่าง)
  const [cart, setCart] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    if (products[0]) init[products[0].id] = 1;
    if (products[1]) init[products[1].id] = 2;
    return init;
  });

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
    .filter((x) => x.product) as { product: Product; qty: number }[];
  const cartTotal = cartItems.reduce((s, x) => s + x.product.price * x.qty, 0);

  const filtered = products.filter(
    (p) =>
      (catId === null || p.category_id === catId) &&
      (search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  }
  function addToCart(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    const p = products.find((x) => x.id === id);
    if (p) showToast(`เพิ่ม "${p.name}" ลงตะกร้าแล้ว`);
  }
  function changeQty(id: string, d: number) {
    setCart((c) => {
      const next = { ...c };
      next[id] = (next[id] || 0) + d;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ===== Top bar ===== */}
      <header className="bg-petrol text-white sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า / ยี่ห้อ..."
            className="flex-1 bg-white/10 placeholder:text-teal-200 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:bg-white/20"
          />
          <button
            type="button"
            onClick={() => setSheet("cart")}
            className="relative w-9 h-9 grid place-items-center"
            aria-label="ตะกร้า"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-signal text-[10px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="relative w-9 h-9 grid place-items-center"
            aria-label="แชท"
          >
            💬
            <span className="absolute -top-1 -right-1 bg-signal text-[10px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">
              2
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* ===== แท็บ: ฟีดสินค้า ===== */}
        {tab === "feed" && (
          <>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-400 mono uppercase">ยินดีต้อนรับ</p>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900">{fullName}</h2>
                {verified ? (
                  <span className="text-[10px] bg-mint-soft text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                    ✓ ยืนยันแล้ว
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-soft text-amber font-semibold px-2 py-0.5 rounded-full">
                    รออนุมัติ
                  </span>
                )}
              </div>
              {clinic && <p className="text-xs text-gray-500">{clinic}</p>}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              <Chip active={catId === null} onClick={() => setCatId(null)}>
                ทั้งหมด
              </Chip>
              {categories.map((c) => (
                <Chip key={c.id} active={catId === c.id} onClick={() => setCatId(c.id)}>
                  {c.name_th}
                </Chip>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">ไม่พบสินค้า</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="h-20 bg-mint-soft grid place-items-center text-4xl">
                      {p.image_emoji ?? "📦"}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      {p.fda_verified && (
                        <span className="text-[9px] mono text-teal-700 bg-mint-soft w-fit px-1.5 py-0.5 rounded mb-1">
                          ✓ อย. verified
                        </span>
                      )}
                      <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{p.brand}</p>
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-sm font-bold text-petrol mono">{money(p.price)}</span>
                        <button
                          type="button"
                          onClick={() => addToCart(p.id)}
                          className="bg-mint text-petrol-ink text-xs font-bold w-7 h-7 rounded-lg grid place-items-center"
                          aria-label="เพิ่มลงตะกร้า"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "fda" && <FdaTab products={products} />}

        {tab === "settings" && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg text-gray-900">ตั้งค่า</h2>
            <SettingsGroup
              items={[
                ["👤", "โปรไฟล์ / ข้อมูลส่วนตัว"],
                ["🏥", "ข้อมูลคลินิก & ที่อยู่จัดส่ง"],
                ["🧾", "ข้อมูลใบกำกับภาษี"],
                ["📁", "เอกสาร อย. / ใบอนุญาต"],
                ["💳", "ช่องทางการชำระเงิน"],
                ["🔔", "การแจ้งเตือน"],
                ["🔒", "ความปลอดภัย (รหัสผ่าน / 2FA)"],
                ["📜", "ประวัติการซื้อขาย"],
              ]}
            />
            <button
              type="button"
              onClick={logout}
              className="w-full bg-white border border-red-100 text-red-600 font-semibold text-sm py-3 rounded-xl"
            >
              ออกจากระบบ
            </button>
            <p className="text-center text-[11px] text-gray-400">
              เมนูตั้งค่าจะเชื่อมข้อมูลจริงในเฟสถัดไป
            </p>
          </div>
        )}
      </main>

      {/* ===== แถบนำทางล่าง ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto grid grid-cols-3">
          <NavBtn on={tab === "feed"} onClick={() => setTab("feed")} icon="🛍️" label="ตลาด" />
          <NavBtn on={tab === "fda"} onClick={() => setTab("fda")} icon="🔎" label="ตรวจ อย." />
          <NavBtn on={tab === "settings"} onClick={() => setTab("settings")} icon="⚙️" label="ตั้งค่า" />
        </div>
      </nav>

      {/* ===== ตะกร้า (bottom sheet) ===== */}
      {sheet === "cart" && (
        <>
          <div onClick={() => setSheet(null)} className="fixed inset-0 bg-black/40 z-40" aria-hidden />
          <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl">
            <div className="p-4">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">ตะกร้าสินค้า</h3>
                <button type="button" onClick={() => setSheet(null)} className="text-gray-400 text-sm">
                  ปิด ✕
                </button>
              </div>

              {cartItems.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">ยังไม่มีสินค้าในตะกร้า</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {cartItems.map(({ product, qty }) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-mint-soft grid place-items-center text-xl flex-none">
                        {product.image_emoji ?? "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
                        <p className="text-[11px] text-gray-400 mono">{money(product.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-none">
                        <button
                          type="button"
                          onClick={() => changeQty(product.id, -1)}
                          className="w-6 h-6 rounded-md border border-gray-200 text-gray-500"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => changeQty(product.id, 1)}
                          className="w-6 h-6 rounded-md border border-gray-200 text-gray-500"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ยอดรวม</span>
                  <span className="mono font-bold text-gray-900">{money(cartTotal)}</span>
                </div>
                <p className="text-[11px] text-teal-600">✓ รวมออกใบกำกับภาษีใบเดียวผ่าน e-Tax</p>
              </div>
              <button
                type="button"
                onClick={() => showToast("ระบบชำระเงินจะเปิดใน Phase ถัดไป")}
                className="w-full mt-3 bg-petrol hover:bg-petrol-2 text-white font-semibold text-sm py-3 rounded-xl transition"
              >
                ดำเนินการชำระเงิน
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-2">
                * ระบบสั่งซื้อ/ชำระเงินจริงอยู่ใน Phase ถัดไป
              </p>
            </div>
          </div>
        </>
      )}

      {/* ===== แชท ===== */}
      <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} threads={BUYER_CHATS} />

      {/* ===== Toast ===== */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] bg-petrol-ink text-white text-xs px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ---------- แท็บตรวจ อย. ---------- */
function FdaTab({ products }: { products: Product[] }) {
  const [val, setVal] = useState("64-2-3-2-0001234");
  const [result, setResult] = useState<null | { ok: boolean; text: string }>(null);

  function check() {
    const match = products.find((p) => p.fda_no === val.trim());
    const validFormat = /^\d{2}-\d-\d-\d-\d{7}$/.test(val.trim());
    if (match || validFormat) {
      setResult({
        ok: true,
        text: match ? "สินค้า: " + match.name : "เลขทะเบียนถูกต้องตามรูปแบบ อย.",
      });
    } else {
      setResult({ ok: false, text: "ไม่พบในฐานข้อมูล — โปรดตรวจสอบเลขทะเบียน" });
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <h3 className="font-bold text-gray-900 text-sm">🔎 ตรวจสอบทะเบียน อย.</h3>
        <p className="text-xs text-gray-500">
          ตรวจเลขทะเบียนกับฐานข้อมูล อย. (Phase ถัดไปจะต่อ API จริงจาก data.go.th)
        </p>
        <div className="flex gap-2">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            aria-label="เลขทะเบียน อย."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm mono focus:outline-none focus:border-mint"
          />
          <button
            type="button"
            onClick={check}
            className="bg-petrol text-white text-xs font-medium px-4 rounded-xl"
          >
            ตรวจสอบ
          </button>
        </div>
        {result && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              result.ok ? "bg-mint-soft text-teal-800" : "bg-signal-soft text-red-700"
            }`}
          >
            <span>{result.ok ? "✅" : "⚠️"}</span>
            <span>{result.text}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm mb-1">📦 แจ้งเตือนวัสดุใกล้หมด</h3>
        <p className="text-xs text-gray-400">จะเชื่อมกับข้อมูลสต็อกจริงในเฟสถัดไป</p>
      </div>
    </div>
  );
}

/* ---------- ชิ้นส่วน ---------- */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-none text-xs px-3 py-1.5 rounded-full border transition ${
        active ? "bg-petrol text-white border-petrol" : "bg-white text-gray-600 border-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function NavBtn({
  on,
  onClick,
  icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 py-2.5 ${on ? "text-mint" : "text-gray-400"}`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function SettingsGroup({ items }: { items: [string, string][] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
      {items.map(([icon, label]) => (
        <button
          key={label}
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700"
        >
          <span className="text-lg">{icon}</span>
          <span className="flex-1">{label}</span>
          <span className="text-gray-300">›</span>
        </button>
      ))}
    </div>
  );
}
