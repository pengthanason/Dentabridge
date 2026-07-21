import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/user";
import Marketplace from "@/components/Marketplace";
import type { Product, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BuyerPage() {
  const supabase = createClient();
  const user = await getCurrentUser();

  // ยิง query พร้อมกัน (ขนาน) แทนอนุกรม — ลด latency
  const [buyerRes, productsRes, categoriesRes] = await Promise.all([
    user
      ? supabase.from("buyer_profiles").select("full_name, clinic_name").eq("profile_id", user.id).single()
      : Promise.resolve({ data: null }),
    supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort"),
  ]);
  const buyer = buyerRes.data;
  const products = productsRes.data;
  const categories = categoriesRes.data;

  return (
    <Marketplace
      fullName={buyer?.full_name ?? "Thanason Boonmak"}
      clinic={buyer?.clinic_name ?? ""}
      products={(products ?? []) as Product[]}
      categories={(categories ?? []) as Category[]}
    />
  );
}
