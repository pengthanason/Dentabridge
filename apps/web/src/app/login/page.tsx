"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { buyerAuthEmail } from "@/lib/auth";
import LineAutoLogin from "@/components/LineAutoLogin";

type Mode = "select" | "buyer" | "seller";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<Mode>("select");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // buyer fields
  const [license, setLicense] = useState("");
  // ใช้ password ร่วมกับฝั่ง seller ได้ (แสดงทีละโหมด)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function loginBuyer(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const email = buyerAuthEmail(license);
    let { error } = await supabase.auth.signInWithPassword({ email, password });
    // เผื่อบัญชีเดิม: รหัสผ่านเก่า = db_ + เลขท้ายบัตร 5 หลัก → ให้พิมพ์แค่ 5 หลักก็เข้าได้
    if (error && /^\d{5}$/.test(password)) {
      ({ error } = await supabase.auth.signInWithPassword({ email, password: `db_${password}` }));
    }
    setLoading(false);
    if (error) return setErr("เลขใบอนุญาตหรือรหัสผ่านไม่ถูกต้อง");
    router.push("/buyer");
    router.refresh();
  }

  async function loginSeller(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) return setErr("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    router.push("/seller");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-petrol to-petrol-ink text-white">
      <LineAutoLogin />
      <div className="w-full max-w-sm">
        {/* แบรนด์ */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-mint grid place-items-center font-bold text-petrol-ink mono">
            DB
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none">DentaBridge</h1>
            <p className="text-[10px] text-teal-200 tracking-wider uppercase mono mt-0.5">
              B2B Compliance Native
            </p>
          </div>
        </div>

        {mode === "select" && (
          <div className="space-y-3">
            <p className="text-center text-sm text-teal-100 mb-4">
              เข้าสู่ระบบในฐานะ
            </p>
            <button
              type="button"
              onClick={() => {
                setErr("");
                setMode("buyer");
              }}
              className="w-full bg-white text-petrol rounded-2xl p-4 text-left flex items-center gap-3 shadow-lg active:scale-[0.99] transition"
            >
              <span className="text-3xl">🦷</span>
              <span>
                <span className="block font-bold">ผู้ซื้อ (ทันตแพทย์)</span>
                <span className="block text-xs text-gray-500">
                  ล็อกอินด้วยเลขใบอนุญาต
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setErr("");
                setMode("seller");
              }}
              className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-left flex items-center gap-3 active:scale-[0.99] transition"
            >
              <span className="text-3xl">🏢</span>
              <span>
                <span className="block font-bold">ผู้ขาย (ดีลเลอร์/บริษัท)</span>
                <span className="block text-xs text-teal-200">
                  ล็อกอินด้วยอีเมล
                </span>
              </span>
            </button>
          </div>
        )}

        {mode === "buyer" && (
          <form
            onSubmit={loginBuyer}
            className="bg-white text-gray-800 rounded-2xl p-5 shadow-lg space-y-3"
          >
            <h2 className="font-bold text-petrol">เข้าสู่ระบบ · ทันตแพทย์</h2>
            <Field
              label="เลขใบอนุญาตประกอบวิชาชีพ"
              value={license}
              onChange={setLicense}
              placeholder="เช่น ท.12345"
            />
            <Field
              label="รหัสผ่าน"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              type="password"
            />
            {err && <Err msg={err} />}
            <Submit loading={loading} label="เข้าสู่ระบบ" />
            <p className="text-xs text-center text-gray-500">
              ยังไม่มีบัญชี?{" "}
              <Link href="/signup/buyer" className="text-mint font-semibold">
                สมัครสำหรับทันตแพทย์
              </Link>
            </p>
            <BackBtn onClick={() => setMode("select")} />
          </form>
        )}

        {mode === "seller" && (
          <form
            onSubmit={loginSeller}
            className="bg-white text-gray-800 rounded-2xl p-5 shadow-lg space-y-3"
          >
            <h2 className="font-bold text-petrol">เข้าสู่ระบบ · ผู้ขาย</h2>
            <Field
              label="อีเมล"
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              type="email"
            />
            <Field
              label="รหัสผ่าน"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              type="password"
            />
            {err && <Err msg={err} />}
            <Submit loading={loading} label="เข้าสู่ระบบ" />
            <p className="text-xs text-center text-gray-500">
              ยังไม่มีบัญชี?{" "}
              <Link href="/signup/seller" className="text-mint font-semibold">
                สมัครสำหรับผู้ขาย
              </Link>
            </p>
            <BackBtn onClick={() => setMode("select")} />
          </form>
        )}
      </div>
    </main>
  );
}

/* ---------- ชิ้นส่วน UI ที่ใช้ซ้ำ ---------- */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "email";
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-mint"
      />
    </label>
  );
}

function Submit({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-petrol hover:bg-petrol-2 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition"
    >
      {loading ? "กำลังดำเนินการ..." : label}
    </button>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      {msg}
    </p>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-xs text-gray-400 pt-1"
    >
      ← เลือกประเภทผู้ใช้ใหม่
    </button>
  );
}
