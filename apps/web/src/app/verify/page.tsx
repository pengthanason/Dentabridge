"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Brand, Submit, ErrMsg } from "@/components/ui";

function VerifyInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const supabase = useMemo(() => createClient(), []);

  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (emailOtp.length !== 6 || phoneOtp.length !== 6)
      return setErr("Please enter the 6-digit code in both fields");

    setLoading(true);
    // TODO(จริง): ตรวจ OTP กับ provider (อีเมล + SMS) — ตอนนี้ mock: รหัส 6 หลักใดก็ผ่าน
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          email_verified: true,
          phone_verified: true,
          status: "active",
        })
        .eq("id", user.id);
      setLoading(false);
      router.push(next);
      router.refresh();
    } else {
      setLoading(false);
      // ไม่มี session (เช่นเปิด "ยืนยันอีเมล" ใน Supabase ไว้) → กลับไปล็อกอิน
      router.push("/login");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-petrol to-petrol-ink px-6 py-10 flex flex-col justify-center">
      <div className="w-full max-w-sm mx-auto">
        <Brand />
        <form onSubmit={submit} className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div>
            <h2 className="font-bold text-petrol">Two-factor identity verification</h2>
            <p className="text-xs text-gray-500">
              We sent a code to your email and SMS.
            </p>
            <p className="text-[11px] text-amber mt-1">
              Test mode: enter any 6-digit number
            </p>
          </div>

          <label className="block">
            <span className="text-xs text-gray-500">Code from email (6 digits)</span>
            <input
              inputMode="numeric"
              value={emailOtp}
              onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="______"
              className="mt-1 w-full text-center tracking-[0.5em] mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-mint"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500">Code from SMS (6 digits)</span>
            <input
              inputMode="numeric"
              value={phoneOtp}
              onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="______"
              className="mt-1 w-full text-center tracking-[0.5em] mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-mint"
            />
          </label>

          <ErrMsg msg={err} />
          <Submit loading={loading} label="Verify and log in" />
        </form>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-petrol" />}>
      <VerifyInner />
    </Suspense>
  );
}
