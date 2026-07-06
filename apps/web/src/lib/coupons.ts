// คูปอง (mock) — รับเมื่อทำสำเร็จบางอย่าง / วันสำคัญ
export type Coupon = {
  code: string;
  label: string;
  type: "percent" | "fixed";
  value: number;
  minSpend: number;
  note: string;
  claimed: boolean;
};

export const COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    label: "ส่วนลดต้อนรับสมาชิกใหม่ 10%",
    type: "percent",
    value: 10,
    minSpend: 1000,
    note: "รับเมื่อสมัครสมาชิกสำเร็จ",
    claimed: true,
  },
  {
    code: "REORDER50",
    label: "สั่งซ้ำ ลด ฿50",
    type: "fixed",
    value: 50,
    minSpend: 500,
    note: "รับเมื่อสั่งซื้อครบ 3 ครั้ง",
    claimed: true,
  },
  {
    code: "SONGKRAN15",
    label: "เทศกาลสงกรานต์ ลด 15%",
    type: "percent",
    value: 15,
    minSpend: 2000,
    note: "วันสำคัญ · 13 เม.ย.",
    claimed: false,
  },
  {
    code: "NEWYEAR200",
    label: "ปีใหม่ ลด ฿200",
    type: "fixed",
    value: 200,
    minSpend: 3000,
    note: "วันสำคัญ · ปีใหม่",
    claimed: false,
  },
];

export function findCoupon(code: string): Coupon | undefined {
  return COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
}

// คืนส่วนลด (บาท) ตามยอด subtotal
export function discountOf(c: Coupon, subtotal: number): number {
  if (subtotal < c.minSpend) return 0;
  return c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
}
