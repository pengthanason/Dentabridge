"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/lib/wishlist";
import { runWithTransition } from "@/lib/pageTransition";
import { IconHeart, IconChat } from "@/components/Icons";

// แถบบนมาตรฐาน — เหมือนกันทุกหน้า: โลโก้+ชื่อ + รายการโปรด + แชท (+ ปุ่มย้อนกลับถ้าเป็นหน้าย่อย)
export default function AppHeader({
  title,
  back = false,
}: {
  title?: string;
  back?: boolean;
}) {
  const router = useRouter();
  const wishlist = useWishlist();

  return (
    <header className="bg-petrol text-white sticky top-0 z-20">
      <div className="max-w-md lg:max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2">
        {back && (
          <button type="button" onClick={() => runWithTransition(() => router.back())} className="text-xl -ml-1 flex-none" aria-label="กลับ">
            ‹
          </button>
        )}
        <div className="w-7 h-7 rounded-lg bg-mint grid place-items-center font-bold text-petrol-ink text-xs mono flex-none">
          DB
        </div>
        <span className="font-bold tracking-tight truncate flex-1">{title ?? "DentaBridge"}</span>

        <Link href="/buyer/wishlist" className="relative flex flex-col items-center justify-center px-1 flex-none text-white" aria-label="รายการโปรด">
          <IconHeart className="w-5 h-5" />
          <span className="text-[9px] leading-none mt-0.5 whitespace-nowrap">รายการโปรด</span>
          {wishlist.length > 0 && (
            <span className="absolute top-0 right-1 bg-signal text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">
              {wishlist.length}
            </span>
          )}
        </Link>
        <Link href="/buyer/chat" className="relative flex flex-col items-center justify-center w-11 flex-none text-white" aria-label="แชท">
          <IconChat className="w-5 h-5" />
          <span className="text-[9px] leading-none mt-0.5">แชท</span>
          <span className="absolute top-0 right-1 bg-signal text-white text-[9px] font-bold rounded-full min-w-4 h-4 px-1 grid place-items-center">
            2
          </span>
        </Link>
      </div>
    </header>
  );
}
