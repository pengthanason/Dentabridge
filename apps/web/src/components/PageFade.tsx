"use client";

import { usePathname } from "next/navigation";

// เปลี่ยน key ตาม path → เนื้อหาหน้า remount + เล่นอนิเมชัน fade ทุกครั้งที่เปลี่ยนหน้า
export default function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // page-fade = fade-in (fallback สำหรับเบราว์เซอร์ที่ไม่รองรับ View Transitions;
  // ถ้ารองรับ VT จะปิด animation นี้แล้วให้ VT ทำ cross-fade แทน — ดู globals.css)
  return (
    <div key={pathname} className="page-fade">
      {children}
    </div>
  );
}
