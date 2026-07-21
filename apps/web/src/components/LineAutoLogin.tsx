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

      // กันวนเด็ดขาด: ถ้าเพิ่งพยายาม auto-login ไปเมื่อ < 45 วิ แปลว่ากำลังวน (session/redirect ไม่ติด)
      // → หยุด แล้วให้ผู้ใช้เข้าเอง (localStorage ทนกว่า sessionStorage บน webview + มี timestamp ให้ retry ได้ทีหลัง)
      const now = Date.now();
      const lastTry = Number(localStorage.getItem("db_line_try") || "0");
      if (now - lastTry < 45000) {
        setActive(false);
        setErr("เข้าสู่ระบบด้วย LINE อัตโนมัติไม่สำเร็จบนอุปกรณ์นี้ — เข้าด้วยเลขใบอนุญาต/รหัสผ่านด้านล่างได้เลย");
        return;
      }
      localStorage.setItem("db_line_try", String(now)); // ตั้งก่อนทุก redirect/replace (กันวน)

      if (!l.isLoggedIn()) {
        l.login({ redirectUri: window.location.href });
        return;
      }
      try {
        const p = await l.getProfile();

        // ทางที่ปลอดภัย: ให้ server ตรวจ idToken แล้วออก credential (password = server secret)
        // ถ้ายังไม่ได้ตั้งค่า verify (LINE_CHANNEL_ID/LINE_AUTH_SECRET) → fallback โหมด demo
        let userId = p.userId;
        let displayName = p.displayName;
        let email = lineAuthEmail(userId);
        let password = lineAuthPassword(userId);
        const idToken = l.getIDToken();
        if (idToken) {
          try {
            const res = await fetch("/api/line-auth", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ idToken }),
            });
            if (res.ok) {
              const d = await res.json();
              userId = d.userId || userId;
              displayName = d.displayName || displayName;
              email = d.email;
              password = d.password; // ยืนยันฝั่ง server แล้ว
            }
          } catch {
            /* server verify ล้ม → ใช้ fallback ด้านล่าง */
          }
        }

        // มีบัญชีอยู่แล้ว → เข้าเลย; ยังไม่มี → สมัครอัตโนมัติจากข้อมูล LINE
        const signIn = await supabase.auth.signInWithPassword({ email, password });
        if (signIn.error) {
          const signUp = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: "buyer",
                full_name: displayName,
                license_no: lineLicenseNo(userId),
                clinic_name: null,
                national_id: null,
              },
            },
          });
          if (signUp.error) {
            // บัญชี LINE เดิม (สร้างก่อนเปิด verify) รหัสผ่านเก่า = fallback → เข้าด้วยรหัสเก่าแล้วอัปเกรดเป็นรหัสใหม่
            const legacy = lineAuthPassword(userId);
            if (legacy !== password) {
              const relog = await supabase.auth.signInWithPassword({ email, password: legacy });
              if (relog.error) throw signUp.error;
              await supabase.auth.updateUser({ password }).catch(() => {});
            } else {
              throw signUp.error;
            }
          }
        }
        if (cancel) return;
        // เช็กว่า session ติดจริงก่อนค่อยเข้า /buyer (กันวนถ้า cookie ไม่ถูกบันทึกบน webview)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setErr("เข้าสู่ระบบสำเร็จแต่บันทึก session ไม่ได้บนอุปกรณ์นี้ — เข้าด้วยเลขใบอนุญาต/รหัสผ่านด้านล่าง");
          setActive(false);
          return;
        }
        // สำคัญ: ห้ามลบ flag db_line_try ตรงนี้! ถ้า cookie ไม่ติดฝั่ง server แล้วเด้งกลับ
        // guard จะได้ยังเจอ flag (< 45 วิ) แล้วหยุด ไม่วน (ปล่อยให้ timeout เคลียร์เอง)
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
