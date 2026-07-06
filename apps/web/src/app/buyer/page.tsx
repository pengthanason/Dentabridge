import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BuyerHome from "@/components/BuyerHome";
import type { Product, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BuyerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verified, status")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (profile.role !== "buyer") redirect("/seller");

  const { data: buyer } = await supabase
    .from("buyer_profiles")
    .select("full_name, clinic_name, license_no")
    .eq("profile_id", user.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort");

  return (
    <BuyerHome
      fullName={buyer?.full_name ?? "ทันตแพทย์"}
      clinic={buyer?.clinic_name ?? ""}
      verified={profile.verified}
      products={(products ?? []) as Product[]}
      categories={(categories ?? []) as Category[]}
    />
  );
}
