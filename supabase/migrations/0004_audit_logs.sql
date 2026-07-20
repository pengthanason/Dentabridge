-- ============================================================
-- Audit logs — บันทึก critical actions เพื่อ compliance (issue #7)
-- รันใน Supabase Dashboard > SQL Editor
-- เขียนได้เฉพาะฝั่ง server ที่ใช้ service_role (bypass RLS) — anon/ผู้ใช้ทั่วไปเข้าไม่ได้
-- ============================================================
create table if not exists public.audit_logs (
  id         bigserial primary key,
  actor_id   uuid references auth.users(id) on delete set null,
  action     text not null,                 -- เช่น 'line_login', 'verify_status_change', 'order_paid'
  target     text,                          -- เช่น order id / profile id
  meta       jsonb,                         -- รายละเอียดเพิ่มเติม
  ip         text,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_actor_idx   on public.audit_logs (actor_id);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at);

-- เปิด RLS แต่ "ไม่สร้าง policy" → ไม่มีใครเข้าผ่าน anon key ได้
-- (server route ที่ใช้ SUPABASE_SERVICE_ROLE_KEY จะ bypass RLS เขียน log ได้)
alter table public.audit_logs enable row level security;
