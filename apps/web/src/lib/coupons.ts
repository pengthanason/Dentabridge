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
    label: "New member welcome discount 10%",
    type: "percent",
    value: 10,
    minSpend: 1000,
    note: "Awarded upon successful registration",
    claimed: true,
  },
  {
    code: "REORDER50",
    label: "Reorder discount ฿50",
    type: "fixed",
    value: 50,
    minSpend: 500,
    note: "Awarded after 3 completed orders",
    claimed: true,
  },
  {
    code: "SONGKRAN15",
    label: "Songkran Festival 15% off",
    type: "percent",
    value: 15,
    minSpend: 2000,
    note: "Special occasion · Apr 13",
    claimed: false,
  },
  {
    code: "NEWYEAR200",
    label: "New Year ฿200 off",
    type: "fixed",
    value: 200,
    minSpend: 3000,
    note: "Special occasion · New Year",
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
