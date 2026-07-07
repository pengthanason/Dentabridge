"use client";

import { useEffect, useRef, useState } from "react";

// แปลงข้อความที่อ่านได้ให้เป็นเลข อย. ที่ใช้ตรวจได้ ("" = ยังไม่เจอที่ชัดพอ)
function matchFda(raw: string): string {
  const s = decodeURIComponent(raw || "");
  // 1) เจอรูปแบบเลขสารบบเต็ม เช่น 10-3-03468-5-0007
  const full = s.match(/\d{1,2}-\d-\d{4,5}-\d-\d{4}/);
  if (full) return full[0];
  // 2) NEWCODE=xxxx ใน URL ของ อย. (จาก QR)
  const code = s.match(/(?:NEWCODE|code)=([A-Za-z0-9]+)/i);
  if (code) return code[1];
  // 3) เลขจดแจ้งเครื่องมือแพทย์ เช่น ผ.1/2559
  const mdc = s.match(/[ผน]\.?\s?\d+\/\d{4}/);
  if (mdc) return mdc[0].replace(/\s/g, "");
  // 4) OCR มักอ่านขีดหาย — ถ้าได้ตัวเลขล้วน 13 หลัก ประกอบกลับเป็นรูปเลขสารบบ
  const digits = s.replace(/\D/g, "");
  if (digits.length === 13) {
    return `${digits.slice(0, 2)}-${digits[2]}-${digits.slice(3, 8)}-${digits[8]}-${digits.slice(9, 13)}`;
  }
  return "";
}

type BD = { detect: (v: unknown) => Promise<{ rawValue: string }[]> };
type QRFn = (d: Uint8ClampedArray, w: number, h: number, o?: unknown) => { data: string } | null;
type Worker = {
  recognize: (c: unknown) => Promise<{ data: { text: string } }>;
  terminate: () => void;
  setParameters: (p: Record<string, string>) => Promise<unknown>;
};

export default function CameraScan({
  onDetect,
  onClose,
}: {
  onDetect: (v: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bandCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let worker: Worker | null = null;
    let decodeQR: QRFn | null = null;
    let stopped = false;
    let lastCand = "";

    function cleanup() {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
      try {
        worker?.terminate();
      } catch {
        /* ignore */
      }
    }

    function finish(v: string) {
      if (stopped || !v) return;
      cleanup();
      onDetect(v);
    }

    // แถบกลางจอ (สำหรับ OCR เลขหนึ่งบรรทัด) — ขยาย 2x ให้ตัวเลขชัด
    function grabBand(): HTMLCanvasElement | null {
      const v = videoRef.current;
      if (!v || !v.videoWidth) return null;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      const cw = Math.floor(vw * 0.85);
      const ch = Math.floor(vh * 0.22);
      const sx = Math.floor((vw - cw) / 2);
      const sy = Math.floor((vh - ch) / 2);
      const scale = 2;
      const c = bandCanvasRef.current || (bandCanvasRef.current = document.createElement("canvas"));
      c.width = cw * scale;
      c.height = ch * scale;
      const ctx = c.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(v, sx, sy, cw, ch, 0, 0, cw * scale, ch * scale);
      return c;
    }

    // เฟรมเต็ม (ย่อ ≤640px) สำหรับถอด QR ด้วย jsQR
    function grabFull(): ImageData | null {
      const v = videoRef.current;
      if (!v || !v.videoWidth) return null;
      const maxW = 640;
      const scale = Math.min(1, maxW / v.videoWidth);
      const w = Math.round(v.videoWidth * scale);
      const h = Math.round(v.videoHeight * scale);
      const c = fullCanvasRef.current || (fullCanvasRef.current = document.createElement("canvas"));
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(v, 0, 0, w, h);
      return ctx.getImageData(0, 0, w, h);
    }

    (async () => {
      // 1) เปิดกล้องหลัง
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

      // 2) โหลดตัวถอด QR (jsQR) — อ่าน QR ได้จริงทุกอุปกรณ์ รวม iOS
      try {
        decodeQR = ((await import("jsqr")).default as unknown) as QRFn;
      } catch {
        /* ยังใช้ BarcodeDetector/OCR ได้ */
      }

      // 3) BarcodeDetector (ถ้ามี) — เร็วสุดสำหรับ QR/บาร์โค้ดบน Android/Chrome
      const BDClass = (window as unknown as { BarcodeDetector?: new (o?: unknown) => BD }).BarcodeDetector;
      if (BDClass) {
        let detector: BD;
        try {
          detector = new BDClass({ formats: ["qr_code", "code_128", "ean_13", "code_39", "codabar", "data_matrix", "pdf417", "aztec"] });
        } catch {
          detector = new BDClass();
        }
        const scanCode = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length) {
              const rv = codes[0].rawValue || "";
              return finish(matchFda(rv) || rv);
            }
          } catch {
            /* frame not ready */
          }
          raf = requestAnimationFrame(scanCode);
        };
        raf = requestAnimationFrame(scanCode);
      }

      // 4) โหลด OCR (Tesseract) — อ่านตัวเลขที่พิมพ์บนฉลาก
      try {
        const { createWorker } = await import("tesseract.js");
        worker = (await createWorker("eng")) as unknown as Worker;
        await worker.setParameters({
          tessedit_char_whitelist: "0123456789-/.",
          tessedit_pageseg_mode: "7", // single text line
        });
      } catch {
        /* ไม่มี OCR ก็ยังอ่าน QR ได้ */
      }
      if (stopped) return;
      setReady(true);

      // 5) ลูปสแกน: ถอด QR (jsQR) ทุกรอบ + OCR เลขเมื่อ worker พร้อม
      const scanLoop = async () => {
        if (stopped) return;

        // QR ทุกชนิด
        if (decodeQR) {
          const img = grabFull();
          if (img) {
            try {
              const r = decodeQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
              if (r && r.data) return finish(matchFda(r.data) || r.data);
            } catch {
              /* ignore */
            }
          }
        }

        // OCR ตัวเลข
        if (worker) {
          const band = grabBand();
          if (band) {
            try {
              const { data } = await worker.recognize(band);
              const cand = matchFda(data.text || "");
              if (cand) {
                // ต้องอ่านค่าเดิมซ้ำ 2 รอบ กันอ่านพลาด
                if (cand === lastCand) return finish(cand);
                lastCand = cand;
              }
            } catch {
              /* ignore frame error */
            }
          }
        }

        if (!stopped) timer = setTimeout(scanLoop, worker ? 300 : 200);
      };
      scanLoop();
    })();

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />

      {/* กรอบสแกน */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="relative w-[85%] max-w-sm h-28 rounded-2xl border-2 border-mint shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
          <div className="scanline" />
        </div>
      </div>

      {/* หัว */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 text-white">
        <button type="button" onClick={onClose} className="text-2xl" aria-label="ปิด">✕</button>
        <p className="font-semibold">สแกนเลข อย. / QR บนฉลาก</p>
      </div>

      {/* ล่าง */}
      <div className="relative z-10 mt-auto p-5 text-center text-white space-y-3">
        {err ? (
          <p className="text-sm bg-signal/90 rounded-lg px-3 py-2">{err}</p>
        ) : (
          <p className="text-xs text-white/85 flex items-center justify-center gap-2">
            {ready ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-mint animate-ping" />
                เล็งเลข อย. หรือ QR ให้อยู่ในกรอบ — ระบบจะอ่านและตรวจให้อัตโนมัติ
              </>
            ) : (
              <>
                <span className="inline-block w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                กำลังเตรียมระบบอ่าน…
              </>
            )}
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="w-full max-w-sm mx-auto border border-white/40 text-white font-medium text-sm py-2.5 rounded-xl"
        >
          กรอกเลขเอง
        </button>
      </div>
    </div>
  );
}
