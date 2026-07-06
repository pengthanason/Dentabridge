# DentaBridge

B2B Compliance-Native Marketplace สำหรับวงการทันตกรรม — ผู้ซื้อ (ทันตแพทย์/คลินิก) · ผู้ขาย (ดีลเลอร์/บริษัท) · แอดมิน

## โครงสร้างโปรเจกต์ (Monorepo — npm workspaces)

```
dentabridge/
├── apps/
│   ├── web/          Next.js — เว็บหลัก (ผู้ซื้อ + ผู้ขาย, เปิดผ่าน LINE LIFF)
│   └── admin/        Next.js — เว็บแอดมิน (แยก, จะทำใน Phase 6)
├── supabase/
│   ├── migrations/   schema SQL (รันใน Supabase SQL Editor)
│   └── seed.sql      ข้อมูลตัวอย่าง
├── legacy/           index.html เดิม (prototype ตัวแรก เก็บไว้อ้างอิง)
└── package.json      workspaces root
```

## การตั้งค่าครั้งแรก

### 1) สร้างโปรเจกต์ Supabase
1. ไปที่ https://supabase.com → New project
2. เข้า **SQL Editor** → รันไฟล์ `supabase/migrations/0001_init.sql` → จากนั้นรัน `supabase/seed.sql`
3. เข้า **Authentication > Providers > Email** → **ปิด** "Confirm email" (ช่วงพัฒนา ใช้ mock 2FA แทน)
4. เข้า **Project Settings > API** → คัดลอก `Project URL` และ `anon public key`

### 2) ตั้งค่า env ของเว็บหลัก
```bash
cd apps/web
cp .env.local.example .env.local
# แก้ค่า NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_LIFF_ID
```

### 3) รันในเครื่อง
```bash
npm install          # ที่ root (ติดตั้งทั้ง workspace)
npm run dev          # รันเว็บหลัก http://localhost:3000
```

## Deploy บน Vercel
- สร้าง **2 โปรเจกต์** จาก repo เดียวกัน:
  - เว็บหลัก → **Root Directory = `apps/web`**
  - แอดมิน → **Root Directory = `apps/admin`** (เมื่อทำ Phase 6)
- ใส่ Environment Variables (URL/anon key/LIFF ID) ในแต่ละโปรเจกต์
- **LINE LIFF**: เอา URL ของเว็บหลักบน Vercel ไปตั้งเป็น *Endpoint URL* ในหน้า LIFF app

## สถานะฟีเจอร์ (Phase 1 — เสร็จแล้ว)
- ✅ Auth: เลือก role → ล็อกอิน (ผู้ซื้อ = เลขใบอนุญาต + เลขท้ายบัตร 5 หลัก / ผู้ขาย = อีเมล + รหัสผ่าน)
- ✅ สมัครสมาชิกทั้ง 2 role (ฟิลด์ตามสเปก) + ยืนยันตัวตน 2 ชั้น (mock)
- ✅ กันเส้นทางตาม role (middleware) + หน้า home แยกผู้ซื้อ/ผู้ขาย
- ✅ ฟีดสินค้าดึงจาก Supabase จริง + ค้นหา/ฟิลเตอร์ + ตรวจ อย. (ยังเช็กในเครื่อง)

## แผนเฟสถัดไป
- Phase 2: ตะกร้า + ออเดอร์จริง + ประวัติ + ติดตามสถานะ + ใบกำกับภาษี
- Phase 3: ตรวจ อย. ต่อ API จริง (data.go.th) + ตั้งค่า/เอกสารครบ
- Phase 4: จัดการสินค้า/ออเดอร์ฝั่งผู้ขาย
- Phase 5: แชท, แผนที่/เวลาจัดส่ง, payment, 2FA ของจริง
- Phase 6: เว็บแอดมิน (`apps/admin`)

## หมายเหตุ
- การยืนยันตัวตน 2 ชั้น, payment, แผนที่ ตอนนี้เป็น **mock** — ต่อ provider จริงในเฟสถัดไป
- badge "verified" ออกโดยแอดมินเท่านั้น (ยังไม่เปิดใช้จนกว่าจะทำ Phase 6)
