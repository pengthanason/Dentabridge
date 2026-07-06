import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Supabase client ฝั่ง server component (อ่าน session จาก cookie)
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          // ใน Server Component อาจ set cookie ไม่ได้ — ปล่อยให้ middleware จัดการ refresh
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* noop */
          }
        },
      },
    }
  );
}
