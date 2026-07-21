"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ChatSheet, { type ChatThread } from "@/components/ChatSheet";
import { IconChat } from "@/components/Icons";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";

type Tab = "dash" | "products" | "orders" | "settings";

// แชทจำลองฝั่งผู้ขาย (คุยกับลูกค้า/คลินิก)
const SELLER_CHATS: ChatThread[] = [
  {
    id: "s1",
    name: "Smile Dental Clinic",
    avatar: "🦷",
    last: "I'll order 2 packs.",
    time: "10:24",
    messages: [
      { from: "them", text: "What colors do the O-Rings come in?" },
      { from: "me", text: "All 8 colors are available, with complete FDA certification." },
      { from: "them", text: "I'll order 2 packs." },
      { from: "me", text: "Noted. Your order is confirmed and will ship tomorrow." },
    ],
  },
  {
    id: "s2",
    name: "Bright Smile Dental Clinic",
    avatar: "🏥",
    last: "Thank you.",
    time: "Yesterday",
    messages: [
      { from: "them", text: "What's the expiry year for the new Composite A2 lot?" },
      { from: "me", text: "This lot expires in 2028." },
      { from: "them", text: "Thank you." },
    ],
  },
];

export default function SellerHome({
  shopName,
  verified,
  products,
}: {
  shopName: string;
  verified: boolean;
  products: Product[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("dash");
  const [chatOpen, setChatOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-petrol text-white sticky top-0 z-30">
        <div className="max-w-md lg:max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] text-teal-200 mono uppercase">Seller Store</p>
            <h1 className="font-bold truncate">{shopName}</h1>
          </div>
          <div className="flex items-center gap-1">
            {verified ? (
              <span className="text-[10px] bg-mint text-petrol-ink font-semibold px-2 py-0.5 rounded-full">
                ✓ verified
              </span>
            ) : (
              <span className="text-[10px] bg-amber-soft text-amber font-semibold px-2 py-0.5 rounded-full">
                Pending approval
              </span>
            )}
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="relative w-9 h-9 grid place-items-center"
              aria-label="Messages"
            >
              <IconChat className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-signal text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">
                2
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {tab === "dash" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Kpi label="Today's sales" value="฿0" tone="petrol" />
              <Kpi label="Orders awaiting confirmation" value="0" tone="signal" />
              <Kpi label="Total products" value={String(products.length)} tone="petrol" />
              <Kpi label="Pending payout" value="฿0" tone="petrol" />
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 mb-2">Management menu</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  ["📦", "Products"],
                  ["🧾", "Orders"],
                  ["💬", "Messages"],
                  ["📊", "Reports"],
                  ["🎟️", "Promotions"],
                  ["⭐", "Reviews"],
                  ["💰", "Finance"],
                  ["🏪", "Store settings"],
                ].map(([icon, label]) => (
                  <div key={label} className="py-2">
                    <div className="text-2xl">{icon}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-[11px] text-gray-400">
              Figures and menus will be connected to live data in the next phase.
            </p>
          </>
        )}

        {tab === "products" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900">My products</h2>
              <button
                type="button"
                className="bg-mint text-petrol-ink text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                + Add product
              </button>
            </div>
            {products.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">
                No products yet — add your first product.
              </p>
            ) : (
              products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-mint-soft grid place-items-center text-xl">
                    {p.image_emoji ?? "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400">In stock: {p.stock}</p>
                  </div>
                  <span className="text-sm font-bold text-petrol mono">{money(p.price)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
            <p className="text-3xl mb-2">🧾</p>
            <p className="text-sm text-gray-500">
              The order system will launch in the next phase.
            </p>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg text-gray-900">Settings</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {[
                ["🏪", "Store information & logo"],
                ["🏢", "Company information / documents"],
                ["📍", "Warehouse / shipping address"],
                ["💰", "Payout account"],
                ["🔒", "Security (password / 2FA)"],
              ].map(([icon, label]) => (
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
            <button
              type="button"
              onClick={logout}
              className="w-full bg-white border border-red-100 text-red-600 font-semibold text-sm py-3 rounded-xl"
            >
              Log out
            </button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100">
        <div className="max-w-md lg:max-w-4xl mx-auto grid grid-cols-4">
          <NavBtn on={tab === "dash"} onClick={() => setTab("dash")} icon="📊" label="Dashboard" />
          <NavBtn on={tab === "products"} onClick={() => setTab("products")} icon="📦" label="Products" />
          <NavBtn on={tab === "orders"} onClick={() => setTab("orders")} icon="🧾" label="Orders" />
          <NavBtn on={tab === "settings"} onClick={() => setTab("settings")} icon="⚙️" label="Settings" />
        </div>
      </nav>

      <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} threads={SELLER_CHATS} />
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "petrol" | "signal";
}) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <p className={`text-xl font-bold leading-none ${tone === "signal" ? "text-signal" : "text-petrol"}`}>
        {value}
      </p>
      <p className="text-[10px] text-gray-500 mt-1">{label}</p>
    </div>
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
      className={`flex flex-col items-center gap-0.5 py-2.5 ${
        on ? "text-mint" : "text-gray-400"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
