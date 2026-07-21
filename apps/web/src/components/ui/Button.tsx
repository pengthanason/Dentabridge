import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "info";

const styles: Record<Variant, string> = {
  primary: "bg-petrol text-white hover:bg-petrol-2 shadow-sm",
  secondary: "bg-white text-petrol border border-gray-200 hover:border-mint",
  ghost: "text-petrol hover:bg-mint-soft",
  danger: "bg-signal text-white hover:brightness-95",
  info: "bg-info text-white hover:brightness-95 shadow-sm",
};

// ปุ่มกลาง — touch target ≥44px, focus ring, press feedback สม่ำเสมอทั้งเว็บ
export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }
>(({ variant = "primary", loading, className = "", children, disabled, ...p }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={`min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint ${styles[variant]} ${className}`}
    {...p}
  >
    {loading && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
    {children}
  </button>
));
Button.displayName = "Button";
