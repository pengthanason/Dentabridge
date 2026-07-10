"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { resolvePending, startPageTransition, supportsVT } from "@/lib/pageTransition";

// ดักคลิกลิงก์ภายใน → เริ่ม cross-fade ก่อนที่ Next จะเปลี่ยนหน้า (ไม่แตะ Link เดิม)
export default function SmoothTransitions() {
  const pathname = usePathname();

  // path เปลี่ยน = นำทางเสร็จ → จบ transition
  useEffect(() => {
    resolvePending();
  }, [pathname]);

  useEffect(() => {
    if (!supportsVT()) return;
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (!t) return;
      // ข้ามปุ่ม/ฟอร์ม (เช่น ปุ่มหัวใจในการ์ด) — พวกนี้ไม่ได้นำทาง
      if (t.closest("button, input, select, textarea, label")) return;
      const a = t.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return; // เฉพาะลิงก์ภายใน
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // หน้าเดิม (แค่ hash) — ไม่ต้อง
      startPageTransition(); // เริ่ม transition, ปล่อยให้ Link นำทางต่อ
    }
    // capture: ให้ทำงานก่อน onClick ของ Link
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
