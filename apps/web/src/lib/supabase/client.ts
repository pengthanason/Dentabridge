import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

// Supabase client ฝั่งเบราว์เซอร์ (ใช้ anon key — ปลอดภัยเพราะมี RLS)
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
