"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { buyerAuthEmail } from "@/lib/auth";
import { Brand, Field, Submit, ErrMsg } from "@/components/ui";

export default function BuyerSignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [fullName, setFullName] = useState("");
  const [license, setLicense] = useState("");
  const [clinic, setClinic] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!fullName || !license || !clinic) return setErr("กรุณากรอกข้อมูลให้ครบ");
    if (nationalId.length !== 13) return setErr("เลขบัตรประชาชนต้องมี 13 หลัก");
    if (!email.includes("@")) return setErr("อีเมลไม่ถูกต้อง");
    if (phone.length < 9) return setErr("เบอร์โทรศัพท์ไม่ถูกต้อง");
    if (password.length < 8) return setErr("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    if (!consent) return setErr("กรุณายอมรับการเก็บและใช้ข้อมูลส่วนบุคคล (PDPA)");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: buyerAuthEmail(license),
      password,
      options: {
        data: {
          role: "buyer",
          full_name: fullName,
          license_no: license,
          clinic_name: clinic,
          national_id: nationalId,
          contact_email: email,
          phone,
          pdpa_consent: true,
        },
      },
    });
    setLoading(false);
    if (error) {
      return setErr(
        error.message.includes("already")
          ? "เลขใบอนุญาตนี้ถูกใช้สมัครแล้ว"
          : "สมัครไม่สำเร็จ: " + error.message
      );
    }
    // ไปยืนยันตัวตน 2 ชั้น (mock)
    router.push("/verify?next=/buyer");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-petrol to-petrol-ink px-6 py-10">
      <div className="w-full max-w-sm mx-auto">
        <Brand />
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl p-5 shadow-lg space-y-3"
        >
          <div>
            <h2 className="font-bold text-petrol">สมัครบัญชี · ทันตแพทย์</h2>
            <p className="text-xs text-gray-500">
              ตั้งรหัสผ่านของคุณเอง · เลขบัตรใช้ยืนยันตัวตนเท่านั้น
            </p>
          </div>
          <Field label="ชื่อ - นามสกุล" value={fullName} onChange={setFullName} placeholder="เช่น ทพ. ธนสันต์ บุญมาก" />
          <Field label="เลขใบอนุญาตประกอบวิชาชีพ" value={license} onChange={setLicense} placeholder="เช่น ท.12345" />
          <Field label="สังกัด / คลินิก" value={clinic} onChange={setClinic} placeholder="เช่น คลินิกทันตกรรมสไมล์" />
          <Field
            label="เลขบัตรประชาชน (ยืนยันตัวตน)"
            value={nationalId}
            onChange={(v) => setNationalId(v.replace(/\D/g, "").slice(0, 13))}
            placeholder="13 หลัก"
            inputMode="numeric"
            hint="ใช้ยืนยันตัวตนคลินิก (ไม่ใช่รหัสผ่าน)"
          />
          <Field label="อีเมล" value={email} onChange={setEmail} placeholder="you@email.com" type="email" inputMode="email" />
          <Field label="เบอร์โทรศัพท์" value={phone} onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))} placeholder="08XXXXXXXX" inputMode="tel" />
          <Field label="ตั้งรหัสผ่าน" value={password} onChange={setPassword} placeholder="อย่างน้อย 8 ตัวอักษร" type="password" hint="ใช้เข้าสู่ระบบครั้งต่อไป" />
          <label className="flex items-start gap-2 text-[11px] text-gray-500 leading-snug">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-mint flex-none"
            />
            <span>
              ยินยอมให้ DentaBridge เก็บ รวบรวม และใช้ข้อมูลส่วนบุคคล (รวมถึงเลขใบอนุญาต/เลขบัตรประชาชน)
              เพื่อยืนยันตัวตนและให้บริการ ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA)
            </span>
          </label>
          <ErrMsg msg={err} />
          <Submit loading={loading} label="สมัครและยืนยันตัวตน" />
          <p className="text-xs text-center text-gray-500">
            มีบัญชีแล้ว?{" "}
            <Link href="/login" className="text-mint font-semibold">
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
