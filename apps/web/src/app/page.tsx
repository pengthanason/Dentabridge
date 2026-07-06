import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// หน้าแรก = ตัวกระจายตาม role (middleware กันไม่ให้ผู้ที่ยังไม่ล็อกอินเข้ามา)
export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.role === "seller") redirect("/seller");
  redirect("/buyer");
}
