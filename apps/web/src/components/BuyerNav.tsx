"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { IconBag, IconShieldCheck, IconCart, IconGear } from "@/components/Icons";

type NavItem = {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  match: (p: string) => boolean;
};

const items: NavItem[] = [
  { href: "/buyer", Icon: IconBag, label: "หน้าร้าน", match: (p) => p === "/buyer" || p.startsWith("/buyer/product") },
  { href: "/buyer/fda", Icon: IconShieldCheck, label: "ตรวจ อย.", match: (p) => p.startsWith("/buyer/fda") },
  { href: "/buyer/cart", Icon: IconCart, label: "ตะกร้า", match: (p) => p.startsWith("/buyer/cart") },
  { href: "/buyer/setting", Icon: IconGear, label: "ตั้งค่า", match: (p) => p.startsWith("/buyer/setting") },
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
              className={`relative flex flex-col items-center gap-1 py-2.5 transition-colors ${
                on ? "text-petrol" : "text-gray-400"
              }`}
            >
              {/* ตัวชี้แท็บที่เลือก */}
              <span
                className={`absolute top-0 h-0.5 rounded-full bg-petrol transition-all duration-300 ${
                  on ? "w-9 opacity-100" : "w-0 opacity-0"
                }`}
              />
              <it.Icon className={`w-[22px] h-[22px] transition-transform duration-200 ${on ? "-translate-y-0.5" : ""}`} />
              <span className={`text-[10px] tracking-tight ${on ? "font-semibold" : "font-medium"}`}>{it.label}</span>
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
