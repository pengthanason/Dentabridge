// ค่า Supabase — มี fallback เป็น placeholder เพื่อไม่ให้ "build/prerender" พัง
// ถ้ายังไม่ได้ตั้ง env (เช่นตอน build บน Vercel ก่อนใส่ค่า)
// ตอน runtime จริงต้องตั้ง NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY ใน Vercel เสมอ
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// ไว้เตือนตอน runtime ว่ายังไม่ได้ตั้งค่าจริง
export const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
