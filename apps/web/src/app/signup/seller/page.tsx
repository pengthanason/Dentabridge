"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Brand, Field, Submit, ErrMsg } from "@/components/ui";

export default function SellerSignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyReg, setCompanyReg] = useState("");
  const [taxId, setTaxId] = useState("");
  const [authPerson, setAuthPerson] = useState("");
  const [saleLicense, setSaleLicense] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!companyName || !companyReg || !taxId || !authPerson || !saleLicense)
      return setErr("กรุณากรอกข้อมูลบริษัทให้ครบ");
    if (!email.includes("@")) return setErr("อีเมลไม่ถูกต้อง");
    if (phone.length < 9) return setErr("เบอร์โทรศัพท์ไม่ถูกต้อง");
    if (pw.length < 6) return setErr("รหัสผ่านต้องยาวอย่างน้อย 6 ตัว");
    if (pw !== pw2) return setErr("รหัสผ่านทั้งสองช่องไม่ตรงกัน");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pw,
      options: {
        data: {
          role: "seller",
          company_name: companyName,
          company_reg_no: companyReg,
          tax_id: taxId,
          authorized_person: authPerson,
          sale_license_no: saleLicense,
          shop_name: companyName,
          phone,
        },
      },
    });
    setLoading(false);
    if (error) {
      return setErr(
        error.message.includes("already")
          ? "อีเมลนี้ถูกใช้สมัครแล้ว"
          : "สมัครไม่สำเร็จ: " + error.message
      );
    }
    router.push("/verify?next=/seller");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-petrol to-petrol-ink px-6 py-10">
      <div className="w-full max-w-sm mx-auto">
        <Brand />
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl p-5 shadow-lg space-y-3"
        >
          <h2 className="font-bold text-petrol">สมัครบัญชี · ผู้ขาย</h2>
          <Field label="ชื่อบริษัท" value={companyName} onChange={setCompanyName} placeholder="บจก. เดนทัล ซัพพลาย" />
          <Field label="เลขทะเบียนบริษัท" value={companyReg} onChange={setCompanyReg} placeholder="เลขทะเบียนนิติบุคคล" inputMode="numeric" />
          <Field label="เลขประจำตัวผู้เสียภาษี" value={taxId} onChange={(v) => setTaxId(v.replace(/\D/g, "").slice(0, 13))} placeholder="13 หลัก" inputMode="numeric" />
          <Field label="ผู้มีอำนาจลงนาม" value={authPerson} onChange={setAuthPerson} placeholder="ชื่อ - นามสกุล" />
          <Field label="เลขใบอนุญาตการขาย" value={saleLicense} onChange={setSaleLicense} placeholder="เลขใบอนุญาตขายเครื่องมือแพทย์" />
          <Field label="อีเมล" value={email} onChange={setEmail} placeholder="you@company.com" type="email" inputMode="email" />
          <Field label="เบอร์โทรศัพท์" value={phone} onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))} placeholder="0XXXXXXXXX" inputMode="tel" />
          <Field label="รหัสผ่าน" value={pw} onChange={setPw} placeholder="อย่างน้อย 6 ตัว" type="password" />
          <Field label="ยืนยันรหัสผ่านอีกครั้ง" value={pw2} onChange={setPw2} placeholder="พิมพ์รหัสผ่านซ้ำ" type="password" />
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
