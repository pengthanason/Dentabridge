"use client";

import { useEffect, useRef, useState } from "react";

// แปลงข้อความที่อ่านได้ให้เป็นเลข อย. ("" = ไม่เจอรูปแบบที่ชัดพอ)
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
  const [candidate, setCandidate] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

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
    const maxW = 720;
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

  function finish(value: string, auto: boolean) {
    if (!value) return;
    cleanup();
    onDetect(value, auto);
  }

  // กดถ่าย → อ่านจากภาพนิ่งครั้งเดียว (ไม่เด้งเอง): ลอง QR ก่อน แล้วค่อย OCR
  async function capture() {
    if (reading) return;
    setReading(true);
    setMsg("");
    setCandidate(null);

    // QR จากภาพนิ่ง (แม่น → ใช้ได้ทันที)
    const qr = decodeQRRef.current;
    const im = grabFull();
    if (qr && im) {
      try {
        const r = qr(im.data, im.width, im.height, { inversionAttempts: "attemptBoth" });
        if (r && r.data) {
          setReading(false);
          return finish(matchFda(r.data) || r.data, true);
        }
      } catch {
        /* ignore */
      }
    }

    // OCR ตัวเลข → ให้ยืนยันก่อน (ไม่ auto)
    const band = grabBand();
    if (workerRef.current && band) {
      try {
        const { data } = await workerRef.current.recognize(band);
        const text = (data.text || "").replace(/\s+/g, " ").trim();
        const num = matchFda(text);
        const digits = text.replace(/\D/g, "");
        if (num) setCandidate(num);
        else if (digits.length >= 8) setCandidate(digits);
        else setMsg(text ? `Unclear reading: “${text.slice(0, 24)}” — reposition for clarity and retake` : "Could not read — add light or reposition for clarity and retake");
      } catch {
        setOcrErr(true);
      }
    } else {
      setMsg("Number reader not ready (failed to load) — scan a QR code or enter the number manually");
    }
    setReading(false);
  }

  useEffect(() => {
    stoppedRef.current = false;
    (async () => {
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
        setErr("Unable to open the camera — please grant camera permission and try again");
        return;
      }

      try {
        decodeQRRef.current = ((await import("jsqr")).default as unknown) as QRFn;
      } catch {
        /* ยังกรอกเองได้ */
      }

      try {
        const { createWorker } = await import("tesseract.js");
        const w = (await createWorker("eng")) as unknown as Worker;
        await w.setParameters({
          tessedit_char_whitelist: "0123456789-/",
          tessedit_pageseg_mode: "6",
        });
        if (stoppedRef.current) {
          w.terminate();
          return;
        }
        workerRef.current = w;
        setOcrReady(true);
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

      {/* กรอบเล็งเลข */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="relative w-[88%] max-w-sm h-28 rounded-2xl border-2 border-mint shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
      </div>

      {/* หัว */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 text-white">
        <button type="button" onClick={onClose} className="text-2xl" aria-label="Close">✕</button>
        <p className="font-semibold">Scan FDA number / QR code on the label</p>
      </div>

      {/* ล่าง */}
      <div className="relative z-10 mt-auto p-5 text-center text-white space-y-3">
        {err ? (
          <p className="text-sm bg-signal/90 rounded-lg px-3 py-2">{err}</p>
        ) : candidate ? (
          // ยืนยันเลขที่อ่านได้ก่อน (แก้ปัญหาอ่านผิดแล้วเด้งเอง)
          <div className="bg-black/70 rounded-xl p-4 space-y-3 max-w-sm mx-auto">
            <p className="text-xs text-white/70">Number read:</p>
            <p className="text-2xl font-bold mono text-mint break-all">{candidate}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setCandidate(null); setMsg(""); }}
                className="flex-1 border border-white/40 text-white font-medium text-sm py-2.5 rounded-xl"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={() => finish(candidate, false)}
                className="flex-1 bg-mint text-petrol-ink font-bold text-sm py-2.5 rounded-xl"
              >
                ✓ Use this number
              </button>
            </div>
            <p className="text-[10px] text-white/50">If the number is incorrect, tap “Retake” or edit it in the field after applying</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-white/85">
              {ready ? "Position the FDA number within the frame, let the camera focus, then capture" : "Opening camera…"}
            </p>
            {msg && <p className="text-[11px] text-amber bg-black/50 rounded-lg px-3 py-1.5 inline-block">{msg}</p>}
            {ocrErr && (
              <p className="text-[11px] text-amber bg-black/50 rounded-lg px-3 py-1.5">
                Could not load the number reader (slow or blocked connection) — you can scan a QR code or enter the number manually
              </p>
            )}
            <button
              type="button"
              onClick={capture}
              disabled={!ready || reading}
              className="w-full max-w-sm mx-auto bg-mint disabled:opacity-50 text-petrol-ink font-bold text-base py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {reading ? "Reading…" : "📸 Capture & read number"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full max-w-sm mx-auto border border-white/40 text-white font-medium text-sm py-2.5 rounded-xl"
            >
              Enter number manually
            </button>
          </>
        )}
      </div>
    </div>
  );
}
