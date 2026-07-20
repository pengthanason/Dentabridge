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

// fail-fast: ถ้า production แต่ยังไม่ตั้ง env จริง อย่าปล่อยให้รันเงียบ ๆ ชี้ไป placeholder
// - เตือนดัง ๆ เสมอ (ทั้ง build/runtime)
// - โยน error เฉพาะฝั่ง browser ตอน production (เป็น runtime แน่ ๆ ไม่ใช่ตอน build)
if (!SUPABASE_CONFIGURED) {
  console.error(
    "[Supabase] ยังไม่ได้ตั้ง NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — กำลังใช้ค่า placeholder"
  );
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    throw new Error("Supabase env ไม่ถูกตั้งค่าใน production — ตั้ง NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ใน Vercel");
  }
}
