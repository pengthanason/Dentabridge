import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import BuyerNav from "@/components/BuyerNav";
import PageFade from "@/components/PageFade";
import SmoothTransitions from "@/components/SmoothTransitions";

export const dynamic = "force-dynamic";

// guard: ต้องล็อกอิน + เป็น buyer เท่านั้น (ครอบทุกหน้าใต้ /buyer)
export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, verified")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (profile.role !== "buyer") redirect("/seller");

  // Verification Gate — บังคับให้ผ่านการยืนยันตัวตนก่อนเข้าฝั่งซื้อ (เครื่องมือแพทย์)
  // ปิดไว้เป็นค่าเริ่มต้น (เดโม); ตั้ง REQUIRE_BUYER_VERIFIED=true ใน env เพื่อบังคับใช้ production
  // production เต็มรูปแบบ ควรบังคับ profile.verified (แอดมินอนุมัติ KYC) ด้วย + enforce ที่ RLS
  if (process.env.REQUIRE_BUYER_VERIFIED === "true" && profile.status !== "active") {
    redirect("/verify?next=/buyer");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SmoothTransitions />
      <PageFade>{children}</PageFade>
      <BuyerNav />
    </div>
  );
}
