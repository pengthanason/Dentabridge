import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SellerHome from "@/components/SellerHome";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SellerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, verified")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (profile.role !== "seller") redirect("/buyer");

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("company_name, shop_name")
    .eq("profile_id", user.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <SellerHome
      shopName={seller?.shop_name ?? seller?.company_name ?? "My Store"}
      verified={profile.verified}
      products={(products ?? []) as Product[]}
    />
  );
}
