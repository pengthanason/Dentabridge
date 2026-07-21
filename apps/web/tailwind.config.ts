import type { Config } from "tailwindcss";

// ธีมตาม CI: เขียว-ขาว (ฟอนต์ TH=Prompt, EN=Archivo)
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // เขียวหลัก คลินิก (headers, ปุ่มหลัก) — เข้มขึ้นให้ดูนิ่ง/น่าเชื่อถือ
        petrol: "#0F5C3C",
        "petrol-2": "#0C4A30",
        "petrol-ink": "#08301F",
        // เขียวรอง / accent (health)
        mint: "#16A34A",
        "mint-soft": "#E3F3E9",
        // Medical Blue — ใช้กับ compliance / เอกสาร อย. / ลิงก์ตรวจสอบ (สื่อ "ทางการ/คลินิก")
        info: "#0E6BA8",
        "info-soft": "#E6F1F8",
        // แจ้งเตือน (ใช้เท่าที่จำเป็น)
        signal: "#DC2626",
        "signal-soft": "#FCE8E8",
        // เหลือง (warning)
        amber: "#B45309",
        "amber-soft": "#FBEEDC",
      },
      fontFamily: {
        // IBM Plex superfamily — คลินิก/enterprise + รองรับไทย (ชื่อสินค้า/ผล อย.)
        sans: ['"IBM Plex Sans"', '"IBM Plex Sans Thai"', '"Prompt"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', '"Archivo"', "ui-monospace", "monospace"],
      },
      // เงานุ่มโทนเขียว ทิศทางแสงเดียวกันทั้งแอป (ดูสะอาด น่าเชื่อถือ)
      boxShadow: {
        card: "0 1px 2px rgba(14,63,37,0.04), 0 6px 16px rgba(14,63,37,0.06)",
        "card-hover": "0 2px 6px rgba(14,63,37,0.06), 0 12px 28px rgba(14,63,37,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
