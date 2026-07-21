type Tone = "neutral" | "success" | "warn" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-600",
  success: "bg-mint-soft text-teal-700",
  warn: "bg-amber-soft text-amber",
  danger: "bg-signal-soft text-signal",
  info: "bg-info-soft text-info",
};

export function Badge({ tone = "neutral", className = "", children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

// Trust badge (compliance) — โทน Medical Blue = "ทางการ/ยืนยันแล้ว"
export function VerifiedBadge({ label = "Verified", className = "" }: { label?: string; className?: string }) {
  return (
    <Badge tone="info" className={className}>
      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      {label}
    </Badge>
  );
}
