import { NextResponse } from "next/server";
import crypto from "crypto";
import { lineAuthEmail } from "@/lib/auth";

export const runtime = "nodejs";

// ตรวจ LINE ID token ฝั่ง server (กันปลอม userId) แล้วคืน credential ที่ derive จาก
// "server secret" — client จะได้รหัสผ่านเฉพาะ userId ที่ยืนยันความเป็นเจ้าของแล้วเท่านั้น
// (แก้ช่องโหว่: เดิม password derive จาก userId ล้วน ๆ ซึ่งไม่ลับ → ยึดบัญชีได้)
export async function POST(req: Request) {
  const channelId = process.env.LINE_CHANNEL_ID;
  const secret = process.env.LINE_AUTH_SECRET;

  // ยังไม่ตั้งค่า verify ฝั่ง server → บอก client ให้ fallback (โหมด demo)
  if (!channelId || !secret) {
    return NextResponse.json({ configured: false }, { status: 501 });
  }

  let idToken: string | undefined;
  try {
    idToken = (await req.json())?.idToken;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!idToken) return NextResponse.json({ error: "missing idToken" }, { status: 400 });

  // ยืนยัน token กับ LINE — ป้องกัน token spoofing
  const v = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
  });
  if (!v.ok) return NextResponse.json({ error: "invalid line token" }, { status: 401 });

  const line = (await v.json()) as { sub?: string; name?: string; picture?: string };
  const userId = line.sub;
  if (!userId) return NextResponse.json({ error: "no sub" }, { status: 401 });

  // password = HMAC(userId, SERVER_SECRET) — client เดาเองไม่ได้เพราะไม่รู้ secret
  const password = crypto.createHmac("sha256", secret).update(userId).digest("hex");

  return NextResponse.json({
    configured: true,
    userId,
    email: lineAuthEmail(userId),
    password,
    displayName: line.name ?? "",
    pictureUrl: line.picture ?? "",
  });
}
