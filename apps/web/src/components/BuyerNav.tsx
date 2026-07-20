"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

const items = [
  { href: "/buyer", icon: "🛍️", label: "Marketplace", match: (p: string) => p === "/buyer" || p.startsWith("/buyer/product") },
  { href: "/buyer/fda", icon: "🔎", label: "ตรวจ อย.", match: (p: string) => p.startsWith("/buyer/fda") },
  { href: "/buyer/cart", icon: "🛒", label: "ตะกร้า", match: (p: string) => p.startsWith("/buyer/cart") },
  { href: "/buyer/setting", icon: "⚙️", label: "Setting", match: (p: string) => p.startsWith("/buyer/setting") },
];

export default function BuyerNav() {
  const pathname = usePathname();
  const cart = useCart();
  const count = Object.keys(cart).length; // จำนวน "รายการ" (ไม่ใช่จำนวนชิ้นรวม)

  // ซ่อน nav ในหน้าแชท / รายละเอียดสินค้า / ชำระเงิน (หน้าเต็ม มีแถบของตัวเอง)
  if (
    pathname.startsWith("/buyer/chat") ||
    pathname.startsWith("/buyer/product") ||
    pathname.startsWith("/buyer/cart/pay")
  )
    return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md lg:max-w-4xl mx-auto grid grid-cols-4">
        {items.map((it) => {
          const on = it.match(pathname);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                on ? "text-mint" : "text-gray-400"
              }`}
            >
              {/* ตัวชี้แท็บที่เลือก */}
              <span
                className={`absolute top-0 h-0.5 rounded-full bg-mint transition-all duration-300 ${
                  on ? "w-8 opacity-100" : "w-0 opacity-0"
                }`}
              />
              <span className={`text-lg transition-transform duration-200 ${on ? "scale-110" : ""}`}>{it.icon}</span>
              <span className="text-[10px] font-medium">{it.label}</span>
              {it.href === "/buyer/cart" && count > 0 && (
                <span className="absolute top-1 right-[22%] bg-signal text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
