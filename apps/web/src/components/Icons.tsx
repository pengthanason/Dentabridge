// ไอคอน SVG มาตรฐาน (ชัดกว่าอิโมจิ + สีตาม currentColor)

export function IconHeart({
  filled = false,
  className = "w-5 h-5",
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-7.3a5 5 0 0 0 0-7.1z" />
    </svg>
  );
}

export function IconChat({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.55L3 21l1.95-5.6A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}

// ---------- ไอคอนเส้นสำหรับแถบนำทาง (แทนอิโมจิ ให้ดูโปร) ----------
function Svg({ className = "w-6 h-6", children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

export function IconBag({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Svg>
  );
}

export function IconShieldCheck({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function IconCart({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </Svg>
  );
}

export function IconGear({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

export function IconCheckCircle({ className }: { className?: string }) {
  return (<Svg className={className}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>);
}
export function IconCamera({ className }: { className?: string }) {
  return (<Svg className={className}><path d="M14.5 4h-5L8 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4l-1.5-2z" /><circle cx="12" cy="13" r="3.5" /></Svg>);
}
export function IconBank({ className }: { className?: string }) {
  return (<Svg className={className}><path d="M3 10 12 4l9 6" /><path d="M4 10v9M9 10v9M15 10v9M20 10v9" /><path d="M3 21h18" /></Svg>);
}
export function IconAlert({ className }: { className?: string }) {
  return (<Svg className={className}><path d="M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></Svg>);
}
export function IconTooth({ className }: { className?: string }) {
  return (<Svg className={className}><path d="M12 5.5c-2-2-5.5-1.8-6.5.8-1 2.6.4 6.2 1.6 9 .5 1.2 2.2 1.2 2.5-.1l.9-3.7c.2-.8 1.3-.8 1.5 0l.9 3.7c.3 1.3 2 1.3 2.5.1 1.2-2.8 2.6-6.4 1.6-9-1-2.6-4.5-2.8-6.5-.8z" /></Svg>);
}
export function IconBuilding({ className }: { className?: string }) {
  return (<Svg className={className}><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" /><path d="M15 9h2a2 2 0 0 1 2 2v10" /><path d="M3 21h18M8 7h2M8 11h2M8 15h2" /></Svg>);
}
export function IconBox({ className }: { className?: string }) {
  return (<Svg className={className}><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></Svg>);
}
export function IconPin({ className }: { className?: string }) {
  return (<Svg className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Svg>);
}
export function IconBell({ className }: { className?: string }) {
  return (<Svg className={className}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.5 21a1.7 1.7 0 0 1-3 0" /></Svg>);
}
