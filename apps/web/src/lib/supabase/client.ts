import { createBrowserClient } from "@supabase/ssr";

// Supabase client ฝั่งเบราว์เซอร์ (ใช้ anon key — ปลอดภัยเพราะมี RLS)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
