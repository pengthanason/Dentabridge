// การ์ดกลาง — เงานุ่มโทนเดียวกันทั้งเว็บ
export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`bg-white rounded-2xl border border-gray-100 shadow-card ${className}`}>{children}</div>;
}

// หัวข้อ section ในการ์ด (label ตัวเล็ก tracking กว้าง — โทน clinical)
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400">{children}</h3>;
}
