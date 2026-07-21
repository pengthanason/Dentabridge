"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import AppHeader from "@/components/AppHeader";
import {
  IconTooth,
  IconBuilding,
  IconBox,
  IconShieldCheck,
  IconBank,
  IconBag,
  IconBell,
} from "@/components/Icons";

const ITEMS: { slug: string; icon: ReactNode; label: string }[] = [
  { slug: "profile", icon: <IconTooth className="w-5 h-5" />, label: "Profile" },
  { slug: "clinic", icon: <IconBuilding className="w-5 h-5" />, label: "Clinic information & shipping address" },
  { slug: "tax", icon: <IconBox className="w-5 h-5" />, label: "Tax invoice details" },
  { slug: "docs", icon: <IconShieldCheck className="w-5 h-5" />, label: "FDA documents / licenses" },
  { slug: "payment", icon: <IconBank className="w-5 h-5" />, label: "Payment methods" },
  { slug: "coupon", icon: <IconBag className="w-5 h-5" />, label: "My coupons" },
  { slug: "offers", icon: <IconShieldCheck className="w-5 h-5" />, label: "My price offers" },
  { slug: "notifications", icon: <IconBell className="w-5 h-5" />, label: "Notifications" },
  { slug: "history", icon: <IconBox className="w-5 h-5" />, label: "Order history" },
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-50">
          {ITEMS.map(({ slug, icon, label }) => (
            <Link
              key={slug}
              href={`/buyer/setting/${slug}`}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700"
            >
              <span className="w-9 h-9 rounded-full bg-mint-soft text-petrol grid place-items-center flex-none">
                {icon}
              </span>
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
          Log out
        </button>
      </main>
    </div>
  );
}
