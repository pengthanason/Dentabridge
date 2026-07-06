import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductDetail from "@/components/ProductDetail";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  let categoryName = "";
  if (product.category_id) {
    const { data: c } = await supabase
      .from("categories")
      .select("name_th")
      .eq("id", product.category_id)
      .single();
    categoryName = c?.name_th ?? "";
  }

  return <ProductDetail product={product as Product} categoryName={categoryName} />;
}
