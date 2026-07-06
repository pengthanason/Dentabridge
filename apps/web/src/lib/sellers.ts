// ข้อมูลผู้ขาย (mock) อิงจาก brand ของสินค้า — จนกว่าจะผูก seller จริงใน DB
export type SellerInfo = {
  shop: string;
  sellerName: string;
  verified: boolean;
  rating: number;
  sales: number;
  since: string;
};

const NAMES: Record<string, string> = {
  OrthoLine: "คุณสมชาย รุ่งเรือง",
  FillPro: "คุณวิภา ศรีสุข",
  SafeHand: "คุณอนุชา ทองดี",
  CleanMed: "คุณพรทิพย์ ใจงาม",
  DentJect: "คุณกิตติ วัฒนา",
  DiaBur: "คุณเมธี อุดมสุข",
};

export function sellerFromBrand(brand: string | null): SellerInfo {
  const b = brand || "ผู้ขาย";
  return {
    shop: `ร้าน ${b}`,
    sellerName: NAMES[b] || "คุณผู้ขาย",
    verified: true,
    rating: 4.8,
    sales: 1250,
    since: "2565",
  };
}
