"use client";

import { usePathname } from "next/navigation";

// เปลี่ยน key ตาม path → เนื้อหาหน้า remount + เล่นอนิเมชัน fade ทุกครั้งที่เปลี่ยนหน้า
export default function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade">
      {children}
    </div>
  );
}
