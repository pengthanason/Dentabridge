"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addToCart } from "@/lib/cart";

// สั่งซ้ำ: จับคู่ชื่อสินค้าในออเดอร์กับแคตตาล็อกจริง → ใส่ลงตะกร้า
export default function ReorderButton({
  items,
}: {
  items: { name: string; qty: number }[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function reorder() {
    setLoading(true);
    const { data } = await supabase.from("products").select("id,name").eq("active", true);
    const catalog = (data ?? []) as { id: string; name: string }[];
    let added = 0;
    items.forEach((it) => {
      const p = catalog.find((c) => c.name === it.name);
      if (p) {
        addToCart(p.id, it.qty);
        added += 1;
      }
    });
    setLoading(false);
    if (added === 0) {
      setMsg("สินค้าในออเดอร์นี้ไม่มีขายแล้ว");
      window.setTimeout(() => setMsg(""), 2200);
      return;
    }
    router.push("/buyer/cart");
  }

  return (
    <div>
      <button
        type="button"
        onClick={reorder}
        disabled={loading}
        className="w-full bg-petrol hover:bg-petrol-2 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition"
      >
        {loading ? "กำลังเพิ่มลงตะกร้า..." : "🔁 สั่งซ้ำออเดอร์นี้"}
      </button>
      {msg && <p className="text-[11px] text-signal text-center mt-2">{msg}</p>}
    </div>
  );
}
