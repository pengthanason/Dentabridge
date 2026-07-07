import Link from "next/link";
import AppHeader from "@/components/AppHeader";

const TITLES: Record<string, string> = {
  profile: "โปรไฟล์ / ข้อมูลส่วนตัว",
  clinic: "ข้อมูลคลินิก & ที่อยู่จัดส่ง",
  tax: "ข้อมูลใบกำกับภาษี",
  docs: "เอกสาร อย. / ใบอนุญาต",
  payment: "ช่องทางการชำระเงิน",
  notifications: "การแจ้งเตือน",
  security: "ความปลอดภัย (รหัสผ่าน / 2FA)",
  history: "ประวัติการซื้อขาย",
};

export default function SettingSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const title = TITLES[params.section] ?? "การตั้งค่า";
  return (
    <div>
      <AppHeader title={title} back />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-10 text-center">
        <div className="text-5xl mb-3">🚧</div>
        <h2 className="font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-2">
          หน้านี้อยู่ระหว่างพัฒนา — จะเชื่อมข้อมูลจริงในเฟสถัดไป
        </p>
        <Link
          href="/buyer/setting"
          className="inline-block mt-6 text-mint font-semibold text-sm"
        >
          ‹ กลับไปหน้า Setting
        </Link>
      </main>
    </div>
  );
}
