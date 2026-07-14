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

// ผู้ซื้อที่เข้าผ่าน LINE — map LINE userId เป็นบัญชี Supabase อัตโนมัติ (ไม่ต้องกรอกอะไร)
// email/password derive จาก userId ให้คงที่ เพื่อ signIn ซ้ำได้
export function lineAuthEmail(userId: string): string {
  const clean = userId.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return `line.${clean}@dentabridge.app`;
}
export function lineAuthPassword(userId: string): string {
  return `dbline_${userId.trim()}`;
}
// ค่า license_no สำหรับผู้ใช้ LINE (คอลัมน์ NOT NULL UNIQUE) — ไม่ชนกับเลขใบอนุญาตจริง
export function lineLicenseNo(userId: string): string {
  return `LINE:${userId.trim()}`;
}
