import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { sellerFromBrand } from "@/lib/sellers";
import ProductImage from "@/components/ProductImage";
import AppHeader from "@/components/AppHeader";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  params,
}: {
  params: { brand: string };
}) {
  const brand = decodeURIComponent(params.brand);
  const seller = sellerFromBrand(brand);
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("brand", brand)
    .eq("active", true);
  const list = (products ?? []) as Product[];

  return (
    <div className="pb-6">
      <AppHeader title={seller.shop} back />

      <main className="max-w-md lg:max-w-6xl mx-auto px-4 pt-4 space-y-4">
        {/* หัวร้าน */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-petrol text-white grid place-items-center text-xl font-bold flex-none">
              {brand.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-bold text-gray-900 truncate">{seller.shop}</p>
                {seller.verified && (
                  <span className="text-[10px] bg-mint-soft text-teal-700 font-semibold px-1.5 py-0.5 rounded-full">
                    ✓ verified
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">ผู้ขาย: {seller.sellerName}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <Stat label="คะแนน" value={`⭐ ${seller.rating}`} />
            <Stat label="ขายแล้ว" value={`${seller.sales}+`} />
            <Stat label="เปิดร้านตั้งแต่" value={seller.since} />
          </div>
          <button type="button" className="w-full mt-3 border border-petrol text-petrol font-semibold text-sm py-2 rounded-xl">
            + ติดตามร้านค้า
          </button>
        </div>

        {/* สินค้าในร้าน */}
        <div>
          <p className="text-[10px] mono uppercase text-gray-400 mb-2">สินค้าในร้าน ({list.length})</p>
          {list.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">ยังไม่มีสินค้า</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {list.map((p) => (
                <Link
                  key={p.id}
                  href={`/buyer/product/${p.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                >
                  <ProductImage name={p.name} imageUrl={p.image_url} emoji={p.image_emoji} className="h-24" />
                  <div className="p-3 flex flex-col flex-1">
                    <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">{p.name}</p>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-sm font-bold text-petrol mono">{money(p.price)}</span>
                      <span className="text-[10px] text-mint font-semibold">ดู ›</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl py-2">
      <p className="text-sm font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}
