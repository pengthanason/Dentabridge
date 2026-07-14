import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import ProfileIdentity from "@/components/ProfileIdentity";

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
        <ProfileIdentity
          fallbackName={buyer?.full_name ?? "ธนสันต์ บุญมาก"}
          emailVerified={!!profile?.email_verified}
          phoneVerified={!!profile?.phone_verified}
          verified={!!profile?.verified}
        />

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
