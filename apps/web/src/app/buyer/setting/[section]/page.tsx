import Link from "next/link";

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
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer/setting" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1 truncate">{title}</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-10 text-center">
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
