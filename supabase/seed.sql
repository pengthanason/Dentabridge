-- ============================================================
-- DentaBridge — ข้อมูลตัวอย่าง (seed) รันหลัง 0001_init.sql
-- ============================================================

insert into public.categories (slug, name_th, sort) values
  ('consumable', 'วัสดุ', 1),
  ('ortho',      'จัดฟัน',          2),
  ('filling',    'อุดฟัน',          3),
  ('sterile',    'ฆ่าเชื้อ',         4),
  ('tools',      'เครื่องมือ',       5)
on conflict (slug) do nothing;

-- สินค้าตัวอย่าง (seller_id = null สำหรับ demo; พิกัดโซนกรุงเทพฯ)
insert into public.products (name, category_id, brand, price, fda_no, fda_verified, image_emoji, stock, lat, lng)
select v.name, c.id, v.brand, v.price, v.fda_no, true, v.emoji, v.stock, v.lat, v.lng
from (values
  ('ยางจัดฟัน O-Ring คละสี',      'ortho',      'OrthoLine', 450,   '64-2-3-2-0001234', '🔵', 120, 13.7563, 100.5018),
  ('วัสดุอุดฟัน Composite A2',    'filling',    'FillPro',   1890,  '64-2-1-1-0005678', '🦷', 40,  13.7460, 100.5340),
  ('ถุงมือไนไตรล์ (กล่อง 100)',   'consumable', 'SafeHand',  320,   '63-2-5-2-0002211', '🧤', 300, 13.7280, 100.5240),
  ('น้ำยาฆ่าเชื้อพื้นผิว 1L',      'sterile',    'CleanMed',  280,   '65-2-4-1-0003344', '🧴', 90,  13.7650, 100.5380),
  ('Bracket โลหะ Roth .022',      'ortho',      'OrthoLine', 1200,  '64-2-3-2-0007788', '⚙️', 60,  13.7563, 100.5018),
  ('เข็มฉีดยาชาทันตกรรม',         'consumable', 'DentJect',  550,   '63-2-2-2-0009900', '💉', 150, 13.7010, 100.5390),
  ('หัวกรอเพชร (แพ็ค 5)',         'tools',      'DiaBur',    890,   '65-2-6-2-0001100', '🔩', 75,  13.7010, 100.5390),
  ('ผ้าก๊อซ Sterile (แพ็ค 50)',   'consumable', 'CleanMed',  180,   '62-2-5-1-0004455', '🩹', 200, 13.7650, 100.5380)
) as v(name, cat_slug, brand, price, fda_no, emoji, stock, lat, lng)
join public.categories c on c.slug = v.cat_slug;
