"use client";

import { useEffect, useRef, useState } from "react";

// ดึงเลข อย. จากข้อความที่สแกนได้ (QR/บาร์โค้ด) — รองรับหลายรูปแบบ
function extractFdaNumber(raw: string): string {
  const s = decodeURIComponent(raw || "");
  // เลขสารบบอาหาร 13 หลัก เช่น 10-3-03468-5-0007
  const food = s.match(/\d{1,2}-\d-\d{4,5}-\d-\d{4}/);
  if (food) return food[0];
  // เลขจดแจ้งเครื่องมือแพทย์ เช่น ผ.1/2559
  const mdc = s.match(/[ผน]\.?\s?\d+\/\d{4}/);
  if (mdc) return mdc[0].replace(/\s/g, "");
  // NEWCODE=xxxx ใน URL ของ อย.
  const code = s.match(/(?:NEWCODE|code)=([A-Za-z0-9]+)/i);
  if (code) return code[1];
  return s.trim();
}

export default function CameraScan({
  onDetect,
  onClose,
  demoValue,
}: {
  onDetect: (v: string) => void;
  onClose: () => void;
  demoValue: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    function cleanup() {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setErr("เปิดกล้องไม่ได้ — โปรดอนุญาตการใช้กล้อง แล้วลองใหม่");
        return;
      }

      const BD = (window as unknown as { BarcodeDetector?: new (o?: unknown) => { detect: (v: unknown) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
      if (!BD) {
        setSupported(false);
        return;
      }
      let detector: { detect: (v: unknown) => Promise<{ rawValue: string }[]> };
      try {
        detector = new BD({ formats: ["qr_code", "code_128", "ean_13", "code_39", "codabar", "data_matrix"] });
      } catch {
        detector = new BD();
      }
      const scan = async () => {
        if (stopped || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length) {
            const v = extractFdaNumber(codes[0].rawValue || "");
            cleanup();
            onDetect(v);
            return;
          }
        } catch {
          /* frame not ready */
        }
        raf = requestAnimationFrame(scan);
      };
      raf = requestAnimationFrame(scan);
    })();

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      {/* วิดีโอกล้อง */}
      <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />

      {/* กรอบสแกน */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="w-60 h-60 border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
      </div>

      {/* หัว */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 text-white">
        <button type="button" onClick={onClose} className="text-2xl" aria-label="ปิด">✕</button>
        <p className="font-semibold">สแกนเลข อย. / QR บนฉลาก</p>
      </div>

      {/* ล่าง */}
      <div className="relative z-10 mt-auto p-5 text-center text-white space-y-3">
        {err ? (
          <p className="text-sm text-signal bg-black/50 rounded-lg px-3 py-2">{err}</p>
        ) : (
          <p className="text-xs text-white/80">
            {supported
              ? "เล็งกล้องไปที่ QR / บาร์โค้ด อย. บนฉลาก — ระบบจะอ่านและตรวจให้อัตโนมัติ"
              : "อุปกรณ์นี้อ่านอัตโนมัติไม่ได้ — ใช้ปุ่มจำลองด้านล่าง หรือกรอกเลขเอง"}
          </p>
        )}
        {/* ปุ่มจำลอง (เดโม) — เผื่อไม่มี QR จริง/อุปกรณ์ไม่รองรับ */}
        <button
          type="button"
          onClick={() => onDetect(demoValue)}
          className="w-full max-w-sm mx-auto bg-mint text-petrol-ink font-semibold text-sm py-3 rounded-xl"
        >
          จำลอง: ตรวจเจอเลข อย. ({demoValue})
        </button>
      </div>
    </div>
  );
}
