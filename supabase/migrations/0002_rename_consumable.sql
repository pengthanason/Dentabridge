-- เปลี่ยนชื่อหมวด "วัสดุสิ้นเปลือง" -> "วัสดุ"
-- รันใน Supabase > SQL Editor (ครั้งเดียว)
update public.categories set name_th = 'วัสดุ' where slug = 'consumable';
