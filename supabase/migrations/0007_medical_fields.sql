-- ============================================================
-- ข้อมูลเชิงการแพทย์บนสินค้า (audit medical M1/M4) — additive, ปลอดภัย
-- รันใน Supabase Dashboard > SQL Editor
-- ============================================================
alter table public.products add column if not exists model      text;    -- รุ่น/รหัสรุ่น
alter table public.products add column if not exists origin     text;    -- ประเทศที่ผลิต
alter table public.products add column if not exists ifu_url    text;    -- คู่มือการใช้งาน (IFU)
alter table public.products add column if not exists cert_url   text;    -- ใบรับรอง (CE/ISO)
alter table public.products add column if not exists controlled boolean not null default false; -- สินค้าควบคุม

-- (ทางเลือก) ตัวอย่างเติมข้อมูลให้สินค้าเดิม เพื่อให้เห็นผลบน UI ทันที:
-- update public.products set origin = 'Thailand' where origin is null;
