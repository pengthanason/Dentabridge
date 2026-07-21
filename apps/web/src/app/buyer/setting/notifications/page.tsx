import type { ReactNode } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { IconAlert, IconCamera, IconCart, IconBag, IconCheckCircle } from "@/components/Icons";

type Noti = {
  icon: ReactNode;
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
  href?: string;
  tone?: "danger" | "normal";
};

const NOTIS: Noti[] = [
  {
    icon: <IconAlert className="w-5 h-5" />,
    title: "Safety alert: product FDA registration revoked",
    detail: "The 'Nitrile gloves lot L2312' you previously purchased has been revoked — stop using it and contact the seller",
    time: "30 min",
    unread: true,
    tone: "danger",
  },
  {
    icon: <IconCamera className="w-5 h-5" />,
    title: "Order INV-2026-0001 has been delivered",
    detail: "Tap to 'Inspect on receipt' — scan to check FDA/lot/expiry before confirming receipt",
    time: "1 hr",
    unread: true,
    href: "/buyer/receive/INV-2026-0001",
  },
  {
    icon: <IconCart className="w-5 h-5" />,
    title: "Items left in your cart",
    detail: "You have 3 items in your cart that are not yet paid for",
    time: "Yesterday",
    href: "/buyer/cart",
  },
  {
    icon: <IconAlert className="w-5 h-5" />,
    title: "Material nearing expiry",
    detail: "Composite Resin A2 will expire 10/2026",
    time: "2 days",
  },
  {
    icon: <IconBag className="w-5 h-5" />,
    title: "Promotion from a shop you follow",
    detail: "Dental Vision: 10% off O-Rings",
    time: "3 days",
  },
  {
    icon: <IconCheckCircle className="w-5 h-5" />,
    title: "Clinic verification successful",
    detail: "Your account has been approved",
    time: "5 days",
  },
];

export default function NotificationsPage() {
  return (
    <div>
      <AppHeader title="Notifications" back />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-50 overflow-hidden">
          {NOTIS.map((n, i) => {
            const inner = (
              <>
                <div
                  className={`w-9 h-9 rounded-full grid place-items-center flex-none ${
                    n.tone === "danger" ? "bg-signal-soft text-signal" : "bg-mint-soft text-petrol"
                  }`}
                >
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${n.tone === "danger" ? "text-signal" : "text-gray-800"}`}>
                      {n.title}
                    </p>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-signal flex-none" />}
                  </div>
                  <p className="text-xs text-gray-500">{n.detail}</p>
                  {n.href && <span className="text-[11px] text-mint font-semibold">Tap to take action ›</span>}
                </div>
                <span className="text-[10px] text-gray-400 flex-none">{n.time}</span>
              </>
            );
            return n.href ? (
              <Link key={i} href={n.href} className="flex items-start gap-3 px-4 py-3">
                {inner}
              </Link>
            ) : (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                {inner}
              </div>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-3">
          * Sample notifications — real data will be connected in a future phase
        </p>
      </main>
    </div>
  );
}
