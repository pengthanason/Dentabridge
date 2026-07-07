"use client";

import { useEffect, useRef, useState } from "react";

// แปลงข้อความที่อ่านได้ให้เป็นเลข อย. ที่ใช้ตรวจได้ ("" = ยังไม่เจอที่ชัดพอ)
function matchFda(raw: string): string {
  const s = decodeURIComponent(raw || "");
  const full = s.match(/\d{1,2}-\d-\d{4,5}-\d-\d{4}/); // เลขสารบบเต็ม 10-3-03468-5-0007
  if (full) return full[0];
  const code = s.match(/(?:NEWCODE|code)=([A-Za-z0-9]+)/i); // จาก QR ของ อย.
  if (code) return code[1];
  const mdc = s.match(/[ผน]\.?\s?\d+\/\d{4}/); // เครื่องมือแพทย์ ผ.1/2559
  if (mdc) return mdc[0].replace(/\s/g, "");
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
  onDetect: (v: string, auto: boolean) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bandCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fullCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const decodeQRRef = useRef<QRFn | null>(null);
  const stoppedRef = useRef(false);

  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);
  const [ocrReady, setOcrReady] = useState(false);
  const [ocrErr, setOcrErr] = useState(false);
  const [reading, setReading] = useState(false);
  const [lastRead, setLastRead] = useState("");

  // จับภาพเฉพาะแถบกลางจอ + ทำขาวดำ/ไบนารี (Otsu) ให้ตัวเลขคมก่อนส่งเข้า OCR
  function grabBand(): HTMLCanvasElement | null {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const vw = v.videoWidth;
    const vh = v.videoHeight;
    const cw = Math.floor(vw * 0.88);
    const ch = Math.floor(vh * 0.24);
    const sx = Math.floor((vw - cw) / 2);
    const sy = Math.floor((vh - ch) / 2);
    const scale = 3;
    const c = bandCanvasRef.current || (bandCanvasRef.current = document.createElement("canvas"));
    c.width = cw * scale;
    c.height = ch * scale;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(v, sx, sy, cw, ch, 0, 0, c.width, c.height);

    // ขาวดำ + Otsu threshold
    const img = ctx.getImageData(0, 0, c.width, c.height);
    const px = img.data;
    const hist = new Array(256).fill(0);
    for (let i = 0; i < px.length; i += 4) {
      const g = (px[i] * 299 + px[i + 1] * 587 + px[i + 2] * 114) / 1000;
      const gi = g | 0;
      px[i] = px[i + 1] = px[i + 2] = gi;
      hist[gi]++;
    }
    const total = c.width * c.height;
    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * hist[i];
    let sumB = 0;
    let wB = 0;
    let maxVar = 0;
    let thresh = 128;
    for (let i = 0; i < 256; i++) {
      wB += hist[i];
      if (wB === 0) continue;
      const wF = total - wB;
      if (wF === 0) break;
      sumB += i * hist[i];
      const mB = sumB / wB;
      const mF = (sum - sumB) / wF;
      const between = wB * wF * (mB - mF) * (mB - mF);
      if (between > maxVar) {
        maxVar = between;
        thresh = i;
      }
    }
    for (let i = 0; i < px.length; i += 4) {
      const val = px[i] > thresh ? 255 : 0;
      px[i] = px[i + 1] = px[i + 2] = val;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

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

  function finish(value: string, auto: boolean) {
    if (stoppedRef.current || !value) return;
    cleanup();
    onDetect(value, auto);
  }

  function cleanup() {
    stoppedRef.current = true;
    const v = videoRef.current;
    const stream = v?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    try {
      workerRef.current?.terminate();
    } catch {
      /* ignore */
    }
  }

  // อ่าน OCR จากเฟรมปัจจุบัน 1 ครั้ง — คืน { number, digits, text }
  async function runOcr(): Promise<{ number: string; digits: string; text: string }> {
    const worker = workerRef.current;
    const band = grabBand();
    if (!worker || !band) return { number: "", digits: "", text: "" };
    const { data } = await worker.recognize(band);
    const text = (data.text || "").replace(/\s+/g, " ").trim();
    return { number: matchFda(text), digits: text.replace(/\D/g, ""), text };
  }

  // ปุ่มถ่าย & อ่าน (ผู้ใช้ถือนิ่ง ๆ แล้วกด — แม่นกว่าลูป)
  async function capture() {
    if (reading || !workerRef.current) return;
    setReading(true);
    try {
      const r = await runOcr();
      setLastRead(r.text.slice(0, 40));
      if (r.number) return finish(r.number, false);
      if (r.digits.length >= 8) return finish(r.digits, false); // ให้ผู้ใช้แก้เลขในช่องแล้วกดตรวจเอง
      setLastRead(r.text ? `อ่านได้: ${r.text.slice(0, 30)} (ยังไม่ครบ ลองขยับให้ชัด)` : "อ่านไม่ออก ลองขยับ/เพิ่มแสง");
    } catch {
      setOcrErr(true);
    }
    setReading(false);
  }

  useEffect(() => {
    stoppedRef.current = false;

    (async () => {
      // 1) เปิดกล้องหลัง
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        setErr("เปิดกล้องไม่ได้ — โปรดอนุญาตการใช้กล้อง แล้วลองใหม่");
        return;
      }

      // 2) ตัวถอด QR (jsQR) — ทุกอุปกรณ์รวม iOS
      try {
        decodeQRRef.current = ((await import("jsqr")).default as unknown) as QRFn;
      } catch {
        /* ยังใช้ทางอื่นได้ */
      }

      // 3) BarcodeDetector (Android/Chrome) — QR/บาร์โค้ดเร็วสุด
      const BDClass = (window as unknown as { BarcodeDetector?: new (o?: unknown) => BD }).BarcodeDetector;
      if (BDClass) {
        let detector: BD;
        try {
          detector = new BDClass({ formats: ["qr_code", "code_128", "ean_13", "code_39", "data_matrix", "pdf417"] });
        } catch {
          detector = new BDClass();
        }
        const loopBD = async () => {
          if (stoppedRef.current || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length) {
              const rv = codes[0].rawValue || "";
              return finish(matchFda(rv) || rv, true); // QR = แม่น → กรอก+ตรวจอัตโนมัติ
            }
          } catch {
            /* frame not ready */
          }
          requestAnimationFrame(loopBD);
        };
        requestAnimationFrame(loopBD);
      }

      // 4) โหลด OCR (Tesseract) — บอกสถานะจริงถ้าโหลดไม่ได้
      try {
        const { createWorker } = await import("tesseract.js");
        const w = (await createWorker("eng")) as unknown as Worker;
        await w.setParameters({
          tessedit_char_whitelist: "0123456789-/",
          tessedit_pageseg_mode: "6", // uniform block
        });
        if (stoppedRef.current) {
          w.terminate();
          return;
        }
        workerRef.current = w;
        setOcrReady(true);

        // 5) ลูปอ่านอัตโนมัติ (เผื่อจับได้เอง) + jsQR ทุกรอบ
        const loop = async () => {
          if (stoppedRef.current) return;
          const qr = decodeQRRef.current;
          if (qr) {
            const im = grabFull();
            if (im) {
              try {
                const res = qr(im.data, im.width, im.height, { inversionAttempts: "attemptBoth" });
                if (res && res.data) return finish(matchFda(res.data) || res.data, true);
              } catch {
                /* ignore */
              }
            }
          }
          if (workerRef.current) {
            try {
              const r = await runOcr();
              if (r.text) setLastRead(r.text.slice(0, 30));
              if (r.number) return finish(r.number, false); // เจอเลขครบรูปแบบ → กรอกให้ (ผู้ใช้กดตรวจเอง)
            } catch {
              /* ignore */
            }
          }
          if (!stoppedRef.current) setTimeout(loop, 700);
        };
        loop();
      } catch {
        setOcrErr(true);
      }
    })();

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />

      {/* กรอบสแกน */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="relative w-[88%] max-w-sm h-28 rounded-2xl border-2 border-mint shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
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
          <>
            <p className="text-xs text-white/85">
              {ready ? "วางเลข อย. ให้อยู่ในกรอบ ถือนิ่ง ๆ แล้วกดปุ่มด้านล่าง" : "กำลังเปิดกล้อง…"}
            </p>
            {lastRead && (
              <p className="text-[11px] text-mint bg-black/50 rounded-lg px-3 py-1.5 inline-block mono">{lastRead}</p>
            )}
            {ocrErr && (
              <p className="text-[11px] text-amber bg-black/50 rounded-lg px-3 py-1.5">
                โหลดตัวอ่านเลขไม่ได้ (เน็ตช้า/ถูกบล็อก) — สแกน QR ได้ หรือกรอกเลขเอง
              </p>
            )}

            <button
              type="button"
              onClick={capture}
              disabled={!ocrReady || reading}
              className="w-full max-w-sm mx-auto bg-mint disabled:opacity-50 text-petrol-ink font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              {reading ? "กำลังอ่าน…" : ocrReady ? "📸 อ่านเลขในกรอบ" : "กำลังเตรียมตัวอ่านเลข…"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full max-w-sm mx-auto border border-white/40 text-white font-medium text-sm py-2.5 rounded-xl"
            >
              กรอกเลขเอง
            </button>
          </>
        )}
      </div>
    </div>
  );
}
