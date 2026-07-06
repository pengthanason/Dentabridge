-- เพิ่มสินค้าให้หลากหลาย (รันใน Supabase SQL Editor ต่อจาก seed.sql เดิม)
insert into public.products (name, category_id, brand, price, fda_no, fda_verified, image_emoji, stock, lat, lng)
select v.name, c.id, v.brand, v.price, v.fda_no, true, v.emoji, v.stock, v.lat, v.lng
from (values
  ('ลวดจัดฟัน NiTi 0.014',        'ortho',      'OrthoLine', 380,  'ผ.20/2559', '➰', 90,  13.7563, 100.5018),
  ('Ceramic Bracket ใส',          'ortho',      'ClearOrtho',2400, 'ผ.21/2559', '💎', 45,  13.7460, 100.5340),
  ('Elastic Chain (ยางโซ่)',      'ortho',      'OrthoLine', 250,  'ผ.22/2559', '🔗', 130, 13.7563, 100.5018),
  ('Glass Ionomer อุดฟัน',        'filling',    'FillPro',   1650, 'ผ.23/2559', '🦷', 55,  13.7460, 100.5340),
  ('Bonding Agent (น้ำยายึด)',    'filling',    'BondMax',   1450, 'ผ.24/2559', '🧪', 60,  13.7460, 100.5340),
  ('วัสดุพิมพ์ฟัน Alginate',      'filling',    'ImpressTH', 420,  'ผ.25/2559', '🪥', 110, 13.7280, 100.5240),
  ('สำลีก้อนทันตกรรม (แพ็ค 500)', 'consumable', 'CottonMed', 150,  'ผ.26/2559', '☁️', 300, 13.7280, 100.5240),
  ('ที่ดูดน้ำลาย Saliva Ejector', 'consumable', 'SafeHand',  180,  'ผ.27/2559', '💧', 250, 13.7280, 100.5240),
  ('แก้วกระดาษทันตกรรม (แพ็ค 1000)','consumable','CleanMed',  290,  'ผ.28/2559', '🥤', 200, 13.7650, 100.5380),
  ('ซองอบฆ่าเชื้อ Autoclave',     'sterile',    'SteriPack', 350,  'ผ.29/2559', '📩', 180, 13.7650, 100.5380),
  ('น้ำยาแช่เครื่องมือ 5L',       'sterile',    'CleanMed',  890,  'ผ.30/2559', '🧴', 70,  13.7650, 100.5380),
  ('คีมถอนฟัน Extraction Forceps','tools',      'DentTools', 1250, 'ผ.31/2559', '🔧', 40,  13.7010, 100.5390),
  ('กระจกส่องปาก Mouth Mirror',   'tools',      'DentTools', 220,  'ผ.32/2559', '🪞', 160, 13.7010, 100.5390),
  ('หัวขูดหินปูน Scaler Tip',     'tools',      'DiaBur',    780,  'ผ.33/2559', '🔩', 85,  13.7010, 100.5390)
) as v(name, cat_slug, brand, price, fda_no, emoji, stock, lat, lng)
join public.categories c on c.slug = v.cat_slug;
