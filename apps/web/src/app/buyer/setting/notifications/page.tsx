import Link from "next/link";
import AppHeader from "@/components/AppHeader";

type Noti = {
  icon: string;
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
  href?: string;
  tone?: "danger" | "normal";
};

const NOTIS: Noti[] = [
  {
    icon: "🚨",
    title: "แจ้งเตือนความปลอดภัย: สินค้าถูกเพิกถอนทะเบียน อย.",
    detail: "วัสดุ 'ถุงมือไนไตรล์ ล็อต L2312' ที่คุณเคยซื้อ ถูกเพิกถอน — หยุดใช้และติดต่อผู้ขาย",
    time: "30 นาที",
    unread: true,
    tone: "danger",
  },
  {
    icon: "📷",
    title: "ออเดอร์ INV-2026-0001 จัดส่งถึงแล้ว",
    detail: "แตะเพื่อ 'ตรวจรับของ' — สแกนเช็ก อย./ล็อต/วันหมดอายุ ก่อนยืนยันรับ",
    time: "1 ชม.",
    unread: true,
    href: "/buyer/receive/INV-2026-0001",
  },
  {
    icon: "🛒",
    title: "มีสินค้าค้างในตะกร้า",
    detail: "คุณมี 3 ชิ้นในตะกร้าที่ยังไม่ได้ชำระเงิน",
    time: "เมื่อวาน",
    href: "/buyer/cart",
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
      <AppHeader title="การแจ้งเตือน" back />

      <main className="max-w-md lg:max-w-4xl mx-auto px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
          {NOTIS.map((n, i) => {
            const inner = (
              <>
                <div
                  className={`w-9 h-9 rounded-full grid place-items-center text-lg flex-none ${
                    n.tone === "danger" ? "bg-signal-soft" : "bg-mint-soft"
                  }`}
                >
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${n.tone === "danger" ? "text-signal" : "text-gray-800"}`}>
                      {n.title}
                    </p>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-signal flex-none" />}
                  </div>
                  <p className="text-xs text-gray-500">{n.detail}</p>
                  {n.href && <span className="text-[11px] text-mint font-semibold">แตะเพื่อดำเนินการ ›</span>}
                </div>
                <span className="text-[10px] text-gray-400 flex-none">{n.time}</span>
              </>
            );
            return n.href ? (
              <Link key={i} href={n.href} className="flex items-start gap-3 px-4 py-3">
                {inner}
              </Link>
            ) : (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                {inner}
              </div>
            );
          })}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-3">
          * ตัวอย่างการแจ้งเตือน — เชื่อมข้อมูลจริงในเฟสถัดไป
        </p>
      </main>
    </div>
  );
}
