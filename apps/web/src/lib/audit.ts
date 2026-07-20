import { createClient } from "@supabase/supabase-js";

// บันทึก audit log ฝั่ง server (ใช้ service_role → bypass RLS เขียนตาราง audit_logs)
// ปลอดภัย: ถ้ายังไม่ตั้ง SUPABASE_SERVICE_ROLE_KEY หรือยังไม่มีตาราง → ข้ามเงียบ ๆ ไม่ทำให้ flow พัง
export async function logAudit(entry: {
  actorId?: string | null;
  action: string;
  target?: string | null;
  meta?: Record<string, unknown> | null;
  ip?: string | null;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return; // ยังไม่เปิดใช้ audit (ต้องรัน 0004_audit_logs.sql + ตั้ง env)
  try {
    const admin = createClient(url, key, { auth: { persistSession: false } });
    await admin.from("audit_logs").insert({
      actor_id: entry.actorId ?? null,
      action: entry.action,
      target: entry.target ?? null,
      meta: entry.meta ?? null,
      ip: entry.ip ?? null,
    });
  } catch (e) {
    console.error("[audit] insert failed", e);
  }
}
