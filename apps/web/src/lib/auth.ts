// ผู้ซื้อ (ทันตแพทย์) ล็อกอินด้วย "เลขใบอนุญาต" + "เลขท้ายบัตร ปชช. 5 หลัก"
// แต่ Supabase Auth ใช้ email/password → เรา map เลขใบอนุญาตเป็น synthetic email
// (อีเมลจริงของผู้ใช้เก็บใน profiles.email ไว้ส่งแจ้งเตือน/ยืนยันตัวตนต่างหาก)
export function buyerAuthEmail(licenseNo: string): string {
  const clean = licenseNo.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return `buyer.${clean}@dentabridge.app`;
}

// รหัสผ่านผู้ซื้อ = เลขท้ายบัตร ปชช. 5 หลัก (placeholder). Supabase ต้องการ >= 6 ตัว
// จึงเติม prefix คงที่เพื่อให้ผ่านเงื่อนไข โดยผู้ใช้ยังกรอกแค่ 5 หลักเหมือนเดิม
export function buyerAuthPassword(idLast5: string): string {
  return `db_${idLast5.trim()}`;
}
