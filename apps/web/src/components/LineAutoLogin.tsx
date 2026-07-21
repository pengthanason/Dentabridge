"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureLiff } from "@/lib/liff";
import { lineAuthEmail, lineAuthPassword, lineLicenseNo } from "@/lib/auth";

// ปุ่ม "เข้าสู่ระบบด้วย LINE" (กดเอง) — เลิก auto-login ที่วน redirect ไม่จบบน webview
// ไม่มีอะไรทำงานเองตอนโหลด → หน้าล็อกอินปกติใช้ได้เสมอ ไม่ถูกบัง/ไม่วน
export default function LineButton() {
  const supabase = useMemo(() => createClient(), []);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      const l = await ensureLiff();
      if (!cancel && l) setAvailable(true);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  async function loginWithLine() {
    setErr("");
    setBusy(true);
    try {
      const l = await ensureLiff();
      if (!l) {
        setErr("LINE ยังไม่พร้อมใช้งาน");
        setBusy(false);
        return;
      }
      if (!l.isLoggedIn()) {
        // ยังไม่ได้ล็อกอิน LINE → เด้งไปล็อกอิน (กลับมาแล้วกดปุ่มนี้อีกครั้ง)
        l.login({ redirectUri: window.location.href });
        return;
      }

      const p = await l.getProfile();
      let userId = p.userId;
      let displayName = p.displayName;
      let email = lineAuthEmail(userId);
      let password = lineAuthPassword(userId);

      // ยืนยัน idToken ฝั่ง server (ถ้าตั้งค่าไว้) → รหัสผ่านจาก server secret
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
            password = d.password;
          }
        } catch {
          /* ใช้ fallback */
        }
      }

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
          // บัญชี LINE เดิม รหัสผ่านเก่า → เข้าด้วยรหัสเก่าแล้วอัปเกรด
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

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setErr("อุปกรณ์นี้บันทึก session ไม่ได้ — เข้าด้วยเลขใบอนุญาต/รหัสผ่านด้านล่างแทน");
        setBusy(false);
        return;
      }
      window.location.replace("/buyer");
    } catch (e) {
      console.error("LINE login failed", e);
      setErr("เข้าสู่ระบบด้วย LINE ไม่สำเร็จ — เข้าด้วยเลขใบอนุญาต/รหัสผ่านด้านล่างแทน");
      setBusy(false);
    }
  }

  if (!available) return null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={loginWithLine}
        disabled={busy}
        className="w-full bg-[#06C755] hover:brightness-105 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2"
      >
        {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบด้วย LINE"}
      </button>
      {err && <p className="text-xs text-amber-100 bg-black/25 rounded-lg px-3 py-2 mt-2 text-center">{err}</p>}
    </div>
  );
}
