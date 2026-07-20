import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ตรวจว่า env + migration ที่จำเป็น (issue #1/#5/#6/#7) พร้อมแล้วหรือยัง
// โชว์แค่ boolean ว่า "ตั้งแล้ว/ยัง" — ไม่เปิดเผยค่า key ใด ๆ
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_LIFF_ID: !!process.env.NEXT_PUBLIC_LIFF_ID,
    LINE_CHANNEL_ID: !!process.env.LINE_CHANNEL_ID, // #1
    LINE_AUTH_SECRET: !!process.env.LINE_AUTH_SECRET, // #1
    SUPABASE_SERVICE_ROLE_KEY: !!svc, // #7
  };

  const checks: Record<string, unknown> = {
    // #1 — verify LINE พร้อมเมื่อมีทั้ง 2 ค่า
    "issue1_line_verify_ready": !!(process.env.LINE_CHANNEL_ID && process.env.LINE_AUTH_SECRET),
  };

  if (url && svc) {
    const admin = createClient(url, svc, { auth: { persistSession: false } });
    // #7 — ตาราง audit_logs มีหรือยัง
    try {
      const { error } = await admin.from("audit_logs").select("id").limit(1);
      checks["issue7_audit_logs_table"] = !error;
      if (error) checks["issue7_audit_logs_err"] = error.message;
    } catch (e) {
      checks["issue7_audit_logs_table"] = false;
      checks["issue7_audit_logs_err"] = String(e).slice(0, 120);
    }
    // #6 — คอลัมน์ profiles.consent_at มีหรือยัง
    try {
      const { error } = await admin.from("profiles").select("consent_at").limit(1);
      checks["issue6_consent_at_column"] = !error;
      if (error) checks["issue6_consent_at_err"] = error.message;
    } catch (e) {
      checks["issue6_consent_at_column"] = false;
      checks["issue6_consent_at_err"] = String(e).slice(0, 120);
    }
  } else {
    checks["note"] = "ยังไม่ได้ตั้ง SUPABASE_SERVICE_ROLE_KEY → เช็ก DB (audit/consent) ไม่ได้ + audit log (#7) ยังไม่ทำงาน";
  }

  const ready = {
    issue1_line_verify: checks["issue1_line_verify_ready"] === true,
    issue6_pdpa_consent: checks["issue6_consent_at_column"] === true,
    issue7_audit_logs: env.SUPABASE_SERVICE_ROLE_KEY && checks["issue7_audit_logs_table"] === true,
  };

  return NextResponse.json({ env, checks, ready });
}
