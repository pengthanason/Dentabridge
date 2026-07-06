-- เพิ่มคอลัมน์รูปสินค้าจริง (ใส่ URL รูปถ่ายต่อสินค้า) รันใน Supabase SQL Editor
alter table public.products add column if not exists image_url text;

-- ตัวอย่าง: ใส่รูปจริงให้สินค้า (แก้ URL เป็นรูปจริงของคุณ)
-- update public.products set image_url = 'https://.../oring.jpg' where name ilike '%O-Ring%';
