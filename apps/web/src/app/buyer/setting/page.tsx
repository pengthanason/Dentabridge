"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AppHeader from "@/components/AppHeader";

const ITEMS: [string, string, string][] = [
  ["profile", "👤", "ข้อมูลส่วนตัว"],
  ["clinic", "🏥", "ข้อมูลคลินิก & ที่อยู่จัดส่ง"],
  ["tax", "🧾", "ข้อมูลใบกำกับภาษี"],
  ["docs", "📁", "เอกสาร อย. / ใบอนุญาต"],
  ["payment", "💳", "ช่องทางการชำระเงิน"],
  ["coupon", "🎟️", "คูปองของฉัน"],
  ["offers", "🤝", "ข้อเสนอราคาของฉัน"],
  ["notifications", "🔔", "การแจ้งเตือน"],
  ["history", "📜", "ประวัติการซื้อ"],
];

export default function SettingPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div>
      <AppHeader title="Setting" />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {ITEMS.map(([slug, icon, label]) => (
            <Link
              key={slug}
              href={`/buyer/setting/${slug}`}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700"
            >
              <span className="text-lg">{icon}</span>
              <span className="flex-1">{label}</span>
              <span className="text-gray-300">›</span>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full bg-white border border-red-100 text-red-600 font-semibold text-sm py-3 rounded-xl"
        >
          ออกจากระบบ
        </button>
      </main>
    </div>
  );
}
