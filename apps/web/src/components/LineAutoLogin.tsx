"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureLiff } from "@/lib/liff";
import { lineAuthEmail, lineAuthPassword, lineLicenseNo } from "@/lib/auth";

// เปิดจากแอป LINE → สร้าง/เข้าสู่ระบบอัตโนมัติจากโปรไฟล์ LINE แล้วพาเข้า /buyer เลย
// (เฉพาะเมื่ออยู่ในแอป LINE จริง — บนเบราว์เซอร์ปกติจะไม่ทำงาน ให้ล็อกอินตามปกติ)
export default function LineAutoLogin() {
  const supabase = useMemo(() => createClient(), []);
  // เดาไว้ก่อนจาก User-Agent เพื่อโชว์ overlay ทันที กันฟอร์มล็อกอินแวบ
  const [active, setActive] = useState(
    typeof navigator !== "undefined" && /Line\//i.test(navigator.userAgent)
  );
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      const l = await ensureLiff();
      if (cancel) return;
      if (!l || !l.isInClient()) {
        setActive(false); // ไม่ได้เปิดจากแอป LINE → ล็อกอินปกติ
        return;
      }
      setActive(true);
      if (!l.isLoggedIn()) {
        l.login({ redirectUri: window.location.href });
        return;
      }
      // กันลูป: ถ้าเคยลองแล้วล้ม อย่าวนซ้ำ
      if (sessionStorage.getItem("db_line_auth") === "fail") {
        setActive(false);
        setErr("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ ลองใหม่หรือใช้เลขใบอนุญาต");
        return;
      }
      try {
        const p = await l.getProfile();
        const email = lineAuthEmail(p.userId);
        const password = lineAuthPassword(p.userId);

        // มีบัญชีอยู่แล้ว → เข้าเลย; ยังไม่มี → สมัครอัตโนมัติจากข้อมูล LINE
        const signIn = await supabase.auth.signInWithPassword({ email, password });
        if (signIn.error) {
          const signUp = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: "buyer",
                full_name: p.displayName,
                license_no: lineLicenseNo(p.userId),
                clinic_name: null,
                national_id: null,
              },
            },
          });
          if (signUp.error) throw signUp.error;
        }
        if (cancel) return;
        // เข้าเต็มหน้า เพื่อให้ฝั่ง server อ่าน session cookie แล้วผ่าน guard
        window.location.replace("/buyer");
      } catch (e) {
        console.error("LINE auto-login failed", e);
        sessionStorage.setItem("db_line_auth", "fail");
        setErr("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ ลองใหม่หรือใช้เลขใบอนุญาต");
        setActive(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [supabase]);

  if (!active) {
    return err ? (
      <p className="text-xs text-amber-200 bg-black/20 rounded-lg px-3 py-2 text-center mb-4">{err}</p>
    ) : null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-petrol to-petrol-ink text-white flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-mint grid place-items-center font-bold text-petrol-ink mono">DB</div>
        <span className="font-bold text-xl">DentaBridge</span>
      </div>
      <div className="w-8 h-8 rounded-full border-[3px] border-white/30 border-t-white animate-spin" />
      <p className="text-sm text-teal-100">กำลังเข้าสู่ระบบด้วย LINE…</p>
    </div>
  );
}
