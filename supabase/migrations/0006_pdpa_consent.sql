-- ============================================================
-- PDPA: เก็บเวลาที่ผู้ใช้ยินยอม (issue #6) — additive, ปลอดภัย
-- รันใน Supabase Dashboard > SQL Editor
-- ============================================================
alter table public.profiles add column if not exists consent_at timestamptz;

-- อัปเดต trigger ให้บันทึก consent_at จาก metadata `pdpa_consent` ตอนสมัคร
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

  insert into public.profiles (id, role, email, phone, consent_at)
  values (
    new.id,
    r,
    coalesce(new.raw_user_meta_data ->> 'contact_email', new.email),
    new.raw_user_meta_data ->> 'phone',
    case when (new.raw_user_meta_data ->> 'pdpa_consent') = 'true' then now() else null end
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

-- หมายเหตุ (ยังไม่รวมในไฟล์นี้ — ต้องตัดสินใจ/ทำแยก):
--  • hash/encrypt national_id, license_no (เช่น เก็บ national_id_hash แทน plaintext)
--  • data retention / สิทธิ์ขอลบข้อมูล (PDPA)
