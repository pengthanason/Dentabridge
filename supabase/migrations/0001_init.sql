-- ============================================================
-- DentaBridge — Schema เริ่มต้น (Phase 1)
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor
-- ครอบคลุม: role/profile, ยืนยันตัวตนคลินิก+ผู้ขาย, สินค้า, หมวดหมู่, ออเดอร์
-- ============================================================

-- ---------- ENUM ----------
create type user_role   as enum ('buyer', 'seller', 'admin');
create type acct_status as enum ('pending', 'active', 'suspended');
create type order_status as enum ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled');

-- ============================================================
-- PROFILES — ผูก 1:1 กับ auth.users (ข้อมูลกลางทุก role)
-- ============================================================
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           user_role   not null,
  email          text,
  phone          text,
  email_verified boolean     not null default false,
  phone_verified boolean     not null default false,
  status         acct_status not null default 'pending',
  verified       boolean     not null default false, -- badge ที่ "แอดมิน" อนุมัติเท่านั้น
  created_at     timestamptz not null default now()
);

-- ข้อมูลเฉพาะ "ผู้ซื้อ (ทันตแพทย์/คลินิก)"
create table public.buyer_profiles (
  profile_id   uuid primary key references public.profiles(id) on delete cascade,
  full_name    text not null,
  license_no   text not null unique,          -- เลขใบอนุญาต (ใช้ล็อกอิน)
  clinic_name  text,                          -- สังกัด/คลินิก
  national_id  text,                          -- เลขบัตรประชาชน (ยืนยันตัวตน) — mock ไว้ก่อน
  created_at   timestamptz not null default now()
);

-- ข้อมูลเฉพาะ "ผู้ขาย (บริษัท/ดีลเลอร์)"
create table public.seller_profiles (
  profile_id       uuid primary key references public.profiles(id) on delete cascade,
  company_name     text not null,
  company_reg_no   text,                      -- เลขทะเบียนบริษัท
  tax_id           text,                      -- เลขผู้เสียภาษี
  authorized_person text,                     -- ผู้มีอำนาจ
  sale_license_no  text,                      -- ใบอนุญาตการขาย
  shop_name        text,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- CATALOG — หมวดหมู่ + สินค้า
-- ============================================================
create table public.categories (
  id       serial primary key,
  slug     text not null unique,
  name_th  text not null,
  sort     int  not null default 0
);

create table public.products (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid references public.profiles(id) on delete set null,
  name         text not null,
  category_id  int  references public.categories(id),
  brand        text,
  description  text,
  price        numeric(12,2) not null default 0,
  fda_no       text,                           -- เลขทะเบียน อย.
  fda_verified boolean not null default false,
  image_emoji  text default '📦',
  stock        int  not null default 0,
  active       boolean not null default true,
  lat          double precision,              -- พิกัดคลัง/ร้าน (สำหรับแผนที่+เวลาส่ง)
  lng          double precision,
  created_at   timestamptz not null default now()
);
create index on public.products (category_id);
create index on public.products (seller_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  buyer_id   uuid not null references public.profiles(id) on delete cascade,
  status     order_status not null default 'pending',
  subtotal   numeric(12,2) not null default 0,
  total      numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create index on public.orders (buyer_id);

create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name       text not null,          -- snapshot ชื่อ ณ เวลาสั่ง
  unit_price numeric(12,2) not null,
  qty        int not null default 1
);
create index on public.order_items (order_id);

-- ============================================================
-- TRIGGER: สร้าง profile อัตโนมัติเมื่อมีผู้ใช้ใหม่ใน auth.users
-- อ่านฟิลด์จาก user_metadata ที่ส่งตอน signUp (bypass RLS ด้วย security definer)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r user_role;
begin
  r := (new.raw_user_meta_data ->> 'role')::user_role;

  insert into public.profiles (id, role, email, phone)
  values (
    new.id,
    r,
    coalesce(new.raw_user_meta_data ->> 'contact_email', new.email),
    new.raw_user_meta_data ->> 'phone'
  );

  if r = 'buyer' then
    insert into public.buyer_profiles (profile_id, full_name, license_no, clinic_name, national_id)
    values (
      new.id,
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'license_no',
      new.raw_user_meta_data ->> 'clinic_name',
      new.raw_user_meta_data ->> 'national_id'
    );
  elsif r = 'seller' then
    insert into public.seller_profiles
      (profile_id, company_name, company_reg_no, tax_id, authorized_person, sale_license_no, shop_name)
    values (
      new.id,
      new.raw_user_meta_data ->> 'company_name',
      new.raw_user_meta_data ->> 'company_reg_no',
      new.raw_user_meta_data ->> 'tax_id',
      new.raw_user_meta_data ->> 'authorized_person',
      new.raw_user_meta_data ->> 'sale_license_no',
      new.raw_user_meta_data ->> 'shop_name'
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles        enable row level security;
alter table public.buyer_profiles  enable row level security;
alter table public.seller_profiles enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;

-- profiles: เจ้าของอ่าน/แก้/สร้างของตัวเองได้
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- buyer/seller profiles: เจ้าของเท่านั้น
create policy "own buyer read"   on public.buyer_profiles  for select using (auth.uid() = profile_id);
create policy "own buyer write"  on public.buyer_profiles  for insert with check (auth.uid() = profile_id);
create policy "own buyer update" on public.buyer_profiles  for update using (auth.uid() = profile_id);
create policy "own seller read"   on public.seller_profiles for select using (auth.uid() = profile_id);
create policy "own seller write"  on public.seller_profiles for insert with check (auth.uid() = profile_id);
create policy "own seller update" on public.seller_profiles for update using (auth.uid() = profile_id);

-- categories/products: อ่านได้ทุกคนที่ล็อกอิน
create policy "categories readable" on public.categories for select using (true);
create policy "products readable"   on public.products   for select using (true);
-- ผู้ขายจัดการสินค้าตัวเองได้
create policy "seller manage products" on public.products for all
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

-- orders: ผู้ซื้ออ่าน/สร้างของตัวเอง
create policy "buyer read orders"   on public.orders for select using (auth.uid() = buyer_id);
create policy "buyer create orders" on public.orders for insert with check (auth.uid() = buyer_id);
-- order_items: ผูกกับ order ของตัวเอง
create policy "own order items read"  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()));
create policy "own order items write" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid()));

-- ============================================================
-- หมายเหตุ: เว็บแอดมิน (แยก) จะเชื่อมด้วย service_role key
-- ซึ่ง bypass RLS ทั้งหมด — ใช้ดูข้อมูลรวม/อนุมัติตัวตนได้
-- ============================================================
