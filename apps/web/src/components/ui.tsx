"use client";

// ชิ้นส่วน UI ที่ใช้ซ้ำในหน้า auth/ฟอร์ม

export function Brand() {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      <div className="w-10 h-10 rounded-xl bg-mint grid place-items-center font-bold text-petrol-ink mono">
        DB
      </div>
      <div>
        <h1 className="font-bold text-xl leading-none text-white">DentaBridge</h1>
        <p className="text-[10px] text-teal-200 tracking-wider uppercase mono mt-0.5">
          B2B Compliance Native
        </p>
      </div>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "numeric" | "email" | "tel";
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-mint"
      />
      {hint && <span className="text-[11px] text-gray-400 mt-1 block">{hint}</span>}
    </label>
  );
}

export function Submit({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-petrol hover:bg-petrol-2 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition"
    >
      {loading ? "Processing..." : label}
    </button>
  );
}

export function ErrMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      {msg}
    </p>
  );
}
