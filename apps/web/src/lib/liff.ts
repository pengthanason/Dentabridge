"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";

export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

// init ครั้งเดียว (แชร์ promise) — กันเรียกซ้ำหลายคอมโพเนนต์
let initPromise: Promise<void> | null = null;

// init LIFF ครั้งเดียว แล้วคืน liff object (null ถ้าไม่มี LIFF_ID / init ล้ม)
export async function ensureLiff(): Promise<typeof liff | null> {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) return null;
  try {
    if (!initPromise) initPromise = liff.init({ liffId });
    await initPromise;
    return liff;
  } catch (e) {
    console.error("LIFF init failed", e);
    return null;
  }
}

// hook: ดึงโปรไฟล์ LINE (ชื่อ/รูป) ถ้าเปิดผ่าน LINE หรือเคยล็อกอิน LINE แล้ว
export function useLineProfile() {
  const [profile, setProfile] = useState<LineProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!liffId) {
        setReady(true);
        return;
      }
      try {
        const l = await ensureLiff();
        if (cancel || !l) {
          if (!cancel) setReady(true);
          return;
        }
        if (liff.isLoggedIn()) {
          setLoggedIn(true);
          const p = await liff.getProfile();
          if (!cancel) {
            setProfile({
              userId: p.userId,
              displayName: p.displayName,
              pictureUrl: p.pictureUrl,
              statusMessage: p.statusMessage,
            });
          }
        }
      } catch (e) {
        console.error("LIFF init/getProfile failed", e);
      } finally {
        if (!cancel) setReady(true);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [liffId]);

  // เรียกเมื่อผู้ใช้กด "เชื่อมต่อ LINE" (บนเบราว์เซอร์ปกติที่ยังไม่ล็อกอิน) → เด้งไปล็อกอิน LINE แล้วกลับมา
  function login() {
    try {
      if (liffId) liff.login({ redirectUri: window.location.href });
    } catch (e) {
      console.error("LIFF login failed", e);
    }
  }

  return { profile, ready, loggedIn, login, configured: !!liffId };
}
