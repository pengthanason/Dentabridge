import { cache } from "react";
import { createClient } from "./server";

// cache() = ดึง user ครั้งเดียวต่อ 1 request (dedupe ระหว่าง layout กับ page)
export const getCurrentUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
