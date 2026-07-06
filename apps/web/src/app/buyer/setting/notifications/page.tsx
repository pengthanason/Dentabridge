import Link from "next/link";

const NOTIS: { icon: string; title: string; detail: string; time: string; unread?: boolean }[] = [
  {
    icon: "🚚",
    title: "ออเดอร์ #INV-2026-0001 กำลังจัดส่ง",
    detail: "คาดว่าถึงพรุ่งนี้ 10:00-12:00",
    time: "2 ชม.",
    unread: true,
  },
  {
    icon: "🛒",
    title: "มีสินค้าค้างในตะกร้า",
    detail: "คุณมี 3 ชิ้นในตะกร้าที่ยังไม่ได้ชำระเงิน",
    time: "เมื่อวาน",
    unread: true,
  },
  {
    icon: "⏰",
    title: "วัสดุใกล้หมดอายุ",
    detail: "Composite Resin A2 จะหมดอายุ 10/2026",
    time: "2 วัน",
  },
  {
    icon: "🏷️",
    title: "โปรโมชันจากร้านที่คุณติดตาม",
    detail: "Dental Vision ลดราคายาง O-Ring 10%",
    time: "3 วัน",
  },
  {
    icon: "✅",
    title: "ยืนยันตัวตนคลินิกสำเร็จ",
    detail: "บัญชีของคุณได้รับการอนุมัติแล้ว",
    time: "5 วัน",
  },
];

export default function NotificationsPage() {
  return (
    <div>
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/buyer/setting" className="text-lg" aria-label="กลับ">
            ‹
          </Link>
          <h1 className="font-semibold flex-1">การแจ้งเตือน</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {NOTIS.map((n, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-mint-soft grid place-items-center text-lg flex-none">
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-signal flex-none" />}
                </div>
                <p className="text-xs text-gray-500">{n.detail}</p>
              </div>
              <span className="text-[10px] text-gray-400 flex-none">{n.time}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-3">
          * ตัวอย่างการแจ้งเตือน — เชื่อมข้อมูลจริงในเฟสถัดไป
        </p>
      </main>
    </div>
  );
}
