// ออเดอร์ตัวอย่าง (mock) — ใช้ร่วมกันระหว่างหน้าประวัติ + หน้ารายละเอียด
export type MockItem = { name: string; qty: number; price: number };
export type MockOrder = {
  no: string;
  date: string;
  status: string;
  tone: "ok" | "ship" | "cancel";
  seller: string;
  payment: string;
  address: string;
  items: MockItem[];
};

export const MOCK_ORDERS: MockOrder[] = [
  {
    no: "INV-2026-0001",
    date: "06/07/2026",
    status: "กำลังจัดส่ง",
    tone: "ship",
    seller: "Dental Vision",
    payment: "พร้อมเพย์ (QR)",
    address: "คลินิกทันตกรรมสไมล์ · กรุงเทพฯ",
    items: [
      { name: "ยางจัดฟัน O-Ring คละสี", qty: 1, price: 450 },
      { name: "วัสดุอุดฟัน Composite A2", qty: 2, price: 1890 },
    ],
  },
  {
    no: "INV-2026-0000",
    date: "28/06/2026",
    status: "สำเร็จ",
    tone: "ok",
    seller: "MedSupply TH",
    payment: "บัตร VISA •••• 4242",
    address: "คลินิกทันตกรรมสไมล์ · กรุงเทพฯ",
    items: [
      { name: "ถุงมือไนไตรล์ (กล่อง 100)", qty: 5, price: 320 },
      { name: "ผ้าก๊อซ Sterile (แพ็ค 50)", qty: 10, price: 180 },
      { name: "น้ำยาฆ่าเชื้อพื้นผิว 1L", qty: 5, price: 280 },
    ],
  },
  {
    no: "INV-2025-0092",
    date: "15/06/2026",
    status: "สำเร็จ",
    tone: "ok",
    seller: "ทันตภัณฑ์ไทย",
    payment: "หักบัญชีธนาคารกสิกรไทย",
    address: "คลินิกทันตกรรมสไมล์ · กรุงเทพฯ",
    items: [{ name: "เข็มฉีดยาชาทันตกรรม", qty: 5, price: 550 }],
  },
  {
    no: "INV-2025-0088",
    date: "02/06/2026",
    status: "ยกเลิก",
    tone: "cancel",
    seller: "Dental Vision",
    payment: "พร้อมเพย์ (QR)",
    address: "คลินิกทันตกรรมสไมล์ · กรุงเทพฯ",
    items: [{ name: "หัวกรอเพชร (แพ็ค 5)", qty: 1, price: 890 }],
  },
];

export const orderTotal = (o: MockOrder) =>
  o.items.reduce((s, x) => s + x.qty * x.price, 0);

export const money = (n: number) => "฿" + n.toLocaleString("th-TH");

export const toneCls: Record<string, string> = {
  ok: "bg-mint-soft text-teal-700",
  ship: "bg-amber-soft text-amber",
  cancel: "bg-gray-100 text-gray-400",
};
