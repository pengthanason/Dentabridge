"use client";

import { useState } from "react";

// ภาพสำรอง (เวกเตอร์) เผื่อรูปถ่ายโหลดไม่ขึ้น — วาดตามชนิดสินค้า
type Art = { bg: string; svg: React.ReactNode };

function art(name: string): Art | null {
  const n = name.toLowerCase();
  if (n.includes("o-ring") || n.includes("ยาง"))
    return {
      bg: "from-pink-50 to-mint-soft",
      svg: (
        <svg viewBox="0 0 64 64" className="w-3/5 h-3/5">
          <circle cx="24" cy="26" r="11" fill="none" stroke="#E4572E" strokeWidth="5" />
          <circle cx="40" cy="34" r="11" fill="none" stroke="#2FA25B" strokeWidth="5" />
          <circle cx="30" cy="42" r="9" fill="none" stroke="#3B82F6" strokeWidth="5" />
        </svg>
      ),
    };
  if (n.includes("composite") || n.includes("อุด"))
    return {
      bg: "from-amber-soft to-mint-soft",
      svg: (
        <svg viewBox="0 0 64 64" className="w-3/5 h-3/5">
          <path d="M20 14c-5 0-8 4-8 10 0 10 4 24 8 26 3 1 4-3 5-7s2-6 3-6 2 2 3 6 2 8 5 7c4-2 8-16 8-26 0-6-3-10-8-10-4 0-6 3-8 3s-4-3-8-3z" fill="#fff" stroke="#145C36" strokeWidth="2.5" />
          <circle cx="38" cy="24" r="4" fill="#C98A1E" />
        </svg>
      ),
    };
  if (n.includes("ถุงมือ") || n.includes("glove"))
    return {
      bg: "from-blue-50 to-mint-soft",
      svg: (
        <svg viewBox="0 0 64 64" className="w-1/2 h-1/2">
          <path d="M22 54V32l-4-2c-3-1-3-6 1-6l3 1V16c0-3 4-3 4 0v10h2V12c0-3 4-3 4 0v14h2V14c0-3 4-3 4 0v12h2V18c0-3 4-3 4 0v20c0 9-4 16-13 16z" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ),
    };
  if (n.includes("น้ำยา") || n.includes("ฆ่าเชื้อ") || n.includes("spray"))
    return {
      bg: "from-teal-50 to-mint-soft",
      svg: (
        <svg viewBox="0 0 64 64" className="w-1/2 h-3/5">
          <rect x="22" y="24" width="20" height="30" rx="4" fill="#2FA25B" stroke="#145C36" strokeWidth="2" />
          <rect x="26" y="16" width="12" height="10" fill="#145C36" />
          <path d="M38 12h10M38 16h8M38 20h10" stroke="#15A99A" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    };
  if (n.includes("bracket"))
    return {
      bg: "from-slate-50 to-mint-soft",
      svg: (
        <svg viewBox="0 0 64 64" className="w-3/5 h-2/5">
          <path d="M8 32h48" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          {[16, 32, 48].map((x) => (
            <rect key={x} x={x - 6} y="24" width="12" height="16" rx="3" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          ))}
        </svg>
      ),
    };
  if (n.includes("เข็ม") || n.includes("ฉีด") || n.includes("syring"))
    return {
      bg: "from-mint-soft to-blue-50",
      svg: (
        <svg viewBox="0 0 64 64" className="w-3/5 h-3/5">
          <g transform="rotate(45 32 32)">
            <rect x="20" y="26" width="20" height="12" rx="2" fill="#fff" stroke="#145C36" strokeWidth="2" />
            <rect x="40" y="29" width="10" height="6" fill="#2FA25B" />
            <path d="M50 32h9" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      ),
    };
  if (n.includes("หัวกรอ") || n.includes("เพชร") || n.includes("bur"))
    return {
      bg: "from-mint-soft to-amber-soft",
      svg: (
        <svg viewBox="0 0 64 64" className="w-2/5 h-3/5">
          <rect x="28" y="10" width="8" height="34" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
          <path d="M24 44l8 12 8-12z" fill="#2FA25B" stroke="#145C36" strokeWidth="1.5" />
        </svg>
      ),
    };
  if (n.includes("ก๊อซ") || n.includes("ผ้า") || n.includes("gauze"))
    return {
      bg: "from-mint-soft to-slate-50",
      svg: (
        <svg viewBox="0 0 64 64" className="w-3/5 h-3/5">
          <rect x="16" y="26" width="32" height="24" rx="3" fill="#fff" stroke="#94A3B8" strokeWidth="2" />
          <rect x="12" y="20" width="32" height="24" rx="3" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
          <path d="M28 26v12M22 32h12" stroke="#2FA25B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
    };
  // ไม่มีภาพวาดเฉพาะ → ให้ไปใช้อิโมจิของสินค้าแทน
  return null;
}

// เลือกพื้นไล่เฉดให้อิโมจิ (คงที่ต่อสินค้า จากชื่อ)
const EMOJI_BG = [
  "from-mint-soft to-emerald-100",
  "from-blue-50 to-mint-soft",
  "from-amber-soft to-mint-soft",
  "from-pink-50 to-mint-soft",
  "from-teal-50 to-blue-50",
  "from-slate-50 to-mint-soft",
];
function emojiBg(name: string) {
  const h = Math.abs([...name].reduce((s, c) => s + c.charCodeAt(0), 0));
  return EMOJI_BG[h % EMOJI_BG.length];
}

export default function ProductImage({
  name,
  imageUrl,
  emoji,
  className = "",
}: {
  name: string;
  imageUrl?: string | null;
  emoji?: string | null;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  // 1) มีรูปจริง (image_url) → ใช้รูปจริง
  if (imageUrl && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        onError={() => setErrored(true)}
        className={`object-cover bg-mint-soft ${className}`}
      />
    );
  }

  // 2) มีภาพวาดเฉพาะชนิด → ใช้ภาพวาด
  const a = art(name);
  if (a) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br ${a.bg} ${className}`}>
        {a.svg}
      </div>
    );
  }

  // 3) ไม่มีภาพวาด → โชว์อิโมจิของสินค้าตัวใหญ่บนพื้นไล่เฉด
  return (
    <div className={`grid place-items-center bg-gradient-to-br ${emojiBg(name)} ${className}`}>
      <span className="text-5xl leading-none">{emoji || "📦"}</span>
    </div>
  );
}
