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
      return setErr("Please complete all company details");
    if (!email.includes("@")) return setErr("Invalid email");
    if (phone.length < 9) return setErr("Invalid phone number");
    if (pw.length < 6) return setErr("Password must be at least 6 characters");
    if (pw !== pw2) return setErr("The two passwords do not match");

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
          ? "This email is already registered"
          : "Registration failed: " + error.message
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
          <h2 className="font-bold text-petrol">Sign up · Seller</h2>
          <Field label="Company name" value={companyName} onChange={setCompanyName} placeholder="Dental Supply Co., Ltd." />
          <Field label="Company registration no." value={companyReg} onChange={setCompanyReg} placeholder="Legal entity registration no." inputMode="numeric" />
          <Field label="Tax ID" value={taxId} onChange={(v) => setTaxId(v.replace(/\D/g, "").slice(0, 13))} placeholder="13 digits" inputMode="numeric" />
          <Field label="Authorized signatory" value={authPerson} onChange={setAuthPerson} placeholder="Full name" />
          <Field label="Sales license number" value={saleLicense} onChange={setSaleLicense} placeholder="Medical device sales license number" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@company.com" type="email" inputMode="email" />
          <Field label="Phone number" value={phone} onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))} placeholder="0XXXXXXXXX" inputMode="tel" />
          <Field label="Password" value={pw} onChange={setPw} placeholder="At least 6 characters" type="password" />
          <Field label="Confirm password" value={pw2} onChange={setPw2} placeholder="Re-enter your password" type="password" />
          <ErrMsg msg={err} />
          <Submit loading={loading} label="Sign up and verify identity" />
          <p className="text-xs text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-mint font-semibold">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
