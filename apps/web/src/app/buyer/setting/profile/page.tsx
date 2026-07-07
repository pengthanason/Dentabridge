import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("email, phone, email_verified, phone_verified, verified, status, created_at")
        .eq("id", user.id)
        .single()
    : { data: null };

  const { data: buyer } = user
    ? await supabase
        .from("buyer_profiles")
        .select("full_name, license_no, clinic_name, national_id")
        .eq("profile_id", user.id)
        .single()
    : { data: null };

  const rows: [string, string][] = [
    ["ชื่อ - นามสกุล", buyer?.full_name ?? "—"],
    ["เลขใบอนุญาตประกอบวิชาชีพ", buyer?.license_no ?? "—"],
    ["สังกัด / คลินิก", buyer?.clinic_name ?? "—"],
    ["เลขบัตรประชาชน", buyer?.national_id ?? "—"],
    ["อีเมล", profile?.email ?? "—"],
    ["เบอร์โทรศัพท์", profile?.phone ?? "—"],
  ];

  return (
    <div>
      <AppHeader title="ข้อมูลส่วนตัว" back />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-mint-soft grid place-items-center text-2xl flex-none">
            🦷
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{buyer?.full_name ?? "ทันตแพทย์"}</p>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <Badge ok={!!profile?.email_verified}>อีเมล</Badge>
              <Badge ok={!!profile?.phone_verified}>เบอร์</Badge>
              {profile?.verified ? (
                <span className="text-[10px] bg-mint-soft text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                  ✓ ยืนยันโดยแอดมิน
                </span>
              ) : (
                <span className="text-[10px] bg-amber-soft text-amber font-semibold px-2 py-0.5 rounded-full">
                  รออนุมัติ
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {rows.map(([label, value]) => (
            <div key={label} className="px-4 py-3">
              <p className="text-[11px] text-gray-400">{label}</p>
              <p className="text-sm text-gray-800 mt-0.5 break-words">{value}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-gray-400">
          การแก้ไขข้อมูลจะเปิดใช้ในเฟสถัดไป
        </p>
      </main>
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
