import type { Config } from "tailwindcss";

// ธีมตาม CI: เขียว-ขาว (ฟอนต์ TH=Prompt, EN=Archivo)
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // เขียวหลัก (headers, ปุ่มหลัก)
        petrol: "#1A7A46",
        "petrol-2": "#145C36",
        "petrol-ink": "#0E3F25",
        // เขียวรอง / accent
        mint: "#2FA25B",
        "mint-soft": "#DCF2E4",
        // แจ้งเตือน (ใช้เท่าที่จำเป็น)
        signal: "#E4572E",
        "signal-soft": "#FCE6DF",
        // เหลือง (accent จาก CI)
        amber: "#C98A1E",
        "amber-soft": "#F6E7CE",
      },
      fontFamily: {
        sans: ['"Prompt"', '"Archivo"', "system-ui", "sans-serif"],
        mono: ['"Archivo"', '"Prompt"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
