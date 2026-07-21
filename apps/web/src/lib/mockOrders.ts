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
    status: "Shipping",
    tone: "ship",
    seller: "Dental Vision",
    payment: "PromptPay (QR)",
    address: "Smile Dental Clinic · Bangkok",
    items: [
      { name: "Orthodontic O-Rings, assorted colors", qty: 1, price: 450 },
      { name: "Composite A2 dental filling material", qty: 2, price: 1890 },
    ],
  },
  {
    no: "INV-2026-0000",
    date: "28/06/2026",
    status: "Completed",
    tone: "ok",
    seller: "MedSupply TH",
    payment: "VISA card •••• 4242",
    address: "Smile Dental Clinic · Bangkok",
    items: [
      { name: "Nitrile gloves (box of 100)", qty: 5, price: 320 },
      { name: "Sterile gauze (pack of 50)", qty: 10, price: 180 },
      { name: "Surface disinfectant 1L", qty: 5, price: 280 },
    ],
  },
  {
    no: "INV-2025-0092",
    date: "15/06/2026",
    status: "Completed",
    tone: "ok",
    seller: "Thai Dental Products",
    payment: "Kasikorn Bank direct debit",
    address: "Smile Dental Clinic · Bangkok",
    items: [{ name: "Dental anesthetic needles", qty: 5, price: 550 }],
  },
  {
    no: "INV-2025-0088",
    date: "02/06/2026",
    status: "Cancelled",
    tone: "cancel",
    seller: "Dental Vision",
    payment: "PromptPay (QR)",
    address: "Smile Dental Clinic · Bangkok",
    items: [{ name: "Diamond burs (pack of 5)", qty: 1, price: 890 }],
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
