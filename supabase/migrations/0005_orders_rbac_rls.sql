-- ============================================================
-- เข้มงวด RBAC ที่ระดับฐานข้อมูล (issue #5) — defense-in-depth
-- ให้ "เฉพาะ role=buyer" สร้างคำสั่งซื้อได้ (UI guard กันได้แค่หน้าจอ, RLS คือด่านจริง)
-- รันใน Supabase Dashboard > SQL Editor
-- ============================================================

-- แทนที่ policy insert เดิมของ orders ให้ตรวจ role ด้วย
drop policy if exists "buyer create orders" on public.orders;
create policy "buyer create orders" on public.orders for insert
  with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'buyer'
    )
  );

-- ── สำหรับ production เต็มรูปแบบ (เมื่อมี KYC/อนุมัติแล้ว) ให้บังคับ verified/active ด้วย: ──
-- drop policy if exists "buyer create orders" on public.orders;
-- create policy "buyer create orders" on public.orders for insert
--   with check (
--     auth.uid() = buyer_id
--     and exists (
--       select 1 from public.profiles p
--       where p.id = auth.uid() and p.role = 'buyer'
--         and p.status = 'active'          -- ผ่านยืนยันตัวตน
--         and p.verified = true            -- แอดมินอนุมัติ (KYC)
--     )
--   );
