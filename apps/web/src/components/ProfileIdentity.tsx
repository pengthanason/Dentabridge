"use client";

import { useLineProfile } from "@/lib/liff";

// การ์ดโปรไฟล์ด้านบน — ใช้ชื่อ/รูปจาก LINE ถ้ามี ไม่งั้นใช้ค่าจากระบบ
export default function ProfileIdentity({
  fallbackName,
  emailVerified,
  phoneVerified,
  verified,
}: {
  fallbackName: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  verified: boolean;
}) {
  const { profile, ready, loggedIn, login, configured } = useLineProfile();
  const name = profile?.displayName ?? fallbackName;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-mint-soft grid place-items-center text-2xl flex-none overflow-hidden">
        {profile?.pictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.pictureUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          "🦷"
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900 truncate">{name}</p>

        {profile ? (
          <p className="text-[11px] text-mint mt-0.5 flex items-center gap-1">
            <span className="text-sm leading-none">●</span> LINE account connected
          </p>
        ) : null}

        <div className="flex items-center gap-1 mt-1 flex-wrap">
          <Badge ok={emailVerified}>Email</Badge>
          <Badge ok={phoneVerified}>Phone</Badge>
          {verified ? (
            <span className="text-[10px] bg-mint-soft text-teal-700 font-semibold px-2 py-0.5 rounded-full">
              ✓ Verified by admin
            </span>
          ) : (
            <span className="text-[10px] bg-amber-soft text-amber font-semibold px-2 py-0.5 rounded-full">
              Pending approval
            </span>
          )}
        </div>

        {/* ยังไม่ได้เชื่อม LINE (เปิดบนเบราว์เซอร์ปกติ) → ปุ่มเชื่อมต่อ */}
        {ready && configured && !loggedIn && (
          <button
            type="button"
            onClick={login}
            className="mt-2 text-xs font-semibold text-white bg-[#06C755] px-3 py-1.5 rounded-lg"
          >
            Connect LINE account
          </button>
        )}
      </div>
    </div>
  );
}

function Badge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        ok ? "bg-mint-soft text-teal-700" : "bg-gray-100 text-gray-400"
      }`}
    >
      {ok ? "✓ " : ""}
      {children}
    </span>
  );
}
