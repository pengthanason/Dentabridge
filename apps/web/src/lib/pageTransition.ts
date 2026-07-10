// ทำ cross-fade ตอนเปลี่ยนหน้า ด้วย View Transitions API (เบราว์เซอร์ที่รองรับ)
// เริ่ม transition ก่อน แล้วปล่อยให้ Next นำทาง — resolve เมื่อ path เปลี่ยน (ดู SmoothTransitions)

type VTDoc = Document & { startViewTransition?: (cb: () => unknown) => unknown };

let resolver: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export function supportsVT(): boolean {
  return typeof document !== "undefined" && typeof (document as VTDoc).startViewTransition === "function";
}

// เรียกเมื่อ path เปลี่ยน (นำทางเสร็จ) → จบ transition ให้ภาพใหม่ค่อย ๆ ขึ้น
export function resolvePending() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (resolver) {
    const r = resolver;
    resolver = null;
    r();
  }
}

function begin(navigate?: () => void) {
  const start = (document as VTDoc).startViewTransition?.bind(document);
  if (!start) {
    navigate?.();
    return;
  }
  resolvePending(); // เคลียร์อันก่อนถ้ามี
  start(
    () =>
      new Promise<void>((res) => {
        resolver = res;
        // กันค้าง: ถ้าไม่นำทางจริง/path ไม่เปลี่ยน ให้ปล่อยหลัง 700ms
        timer = setTimeout(() => resolvePending(), 700);
        navigate?.();
      })
  );
}

// สำหรับลิงก์ (Next Link จะนำทางเอง) — แค่เริ่ม transition
export function startPageTransition() {
  begin();
}

// สำหรับนำทางแบบ programmatic เช่น router.back()
export function runWithTransition(navigate: () => void) {
  begin(navigate);
}
