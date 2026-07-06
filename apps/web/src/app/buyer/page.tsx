import { createClient } from "@/lib/supabase/server";
import Marketplace from "@/components/Marketplace";
import type { Product, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BuyerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: buyer } = user
    ? await supabase
        .from("buyer_profiles")
        .select("full_name, clinic_name")
        .eq("profile_id", user.id)
        .single()
    : { data: null };

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
    <Marketplace
      fullName={buyer?.full_name ?? "ทันตแพทย์"}
      clinic={buyer?.clinic_name ?? ""}
      products={(products ?? []) as Product[]}
      categories={(categories ?? []) as Category[]}
    />
  );
}
