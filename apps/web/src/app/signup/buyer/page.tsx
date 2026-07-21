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
    if (!fullName || !license || !clinic) return setErr("Please complete all fields");
    if (nationalId.length !== 13) return setErr("National ID must be 13 digits");
    if (!email.includes("@")) return setErr("Invalid email");
    if (phone.length < 9) return setErr("Invalid phone number");
    if (password.length < 8) return setErr("Password must be at least 8 characters");
    if (!consent) return setErr("Please accept the collection and use of personal data (PDPA)");

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
          ? "This license number is already registered"
          : "Registration failed: " + error.message
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
            <h2 className="font-bold text-petrol">Sign up · Dentist</h2>
            <p className="text-xs text-gray-500">
              Set your own password · National ID is used for identity verification only
            </p>
          </div>
          <Field label="Full name" value={fullName} onChange={setFullName} placeholder="e.g. Dr. Thanason Boonmak" />
          <Field label="License number" value={license} onChange={setLicense} placeholder="e.g. D.12345" />
          <Field label="Clinic / Affiliation" value={clinic} onChange={setClinic} placeholder="e.g. Smile Dental Clinic" />
          <Field
            label="National ID (identity verification)"
            value={nationalId}
            onChange={(v) => setNationalId(v.replace(/\D/g, "").slice(0, 13))}
            placeholder="13 digits"
            inputMode="numeric"
            hint="Used for clinic identity verification (not a password)"
          />
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" type="email" inputMode="email" />
          <Field label="Phone number" value={phone} onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))} placeholder="08XXXXXXXX" inputMode="tel" />
          <Field label="Set password" value={password} onChange={setPassword} placeholder="At least 8 characters" type="password" hint="Used to log in next time" />
          <label className="flex items-start gap-2 text-[11px] text-gray-500 leading-snug">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 accent-mint flex-none"
            />
            <span>
              I consent to DentaBridge collecting and using my personal data (including license number/National ID)
              for identity verification and service provision, in accordance with the Personal Data Protection Act (PDPA)
            </span>
          </label>
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
