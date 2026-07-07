"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SUGGESTIONS, type Source } from "@/lib/helpKb";

type BotMsg = {
  from: "me" | "bot";
  text: string;
  sources?: Source[];
  pending?: boolean;
};

const GREETING: BotMsg = {
  from: "bot",
  text: "สวัสดีค่ะ 🦷 เค้าคือผู้ช่วย DentaBridge ถามได้เลยเรื่องการใช้งานแอป หรือเรื่อง อย. — จะตอบจากข้อมูลจริงและแนบแหล่งอ้างอิงให้เสมอ ไม่เดาข้อมูลค่ะ",
};

// แยกลิงก์ภายในแอป (ขึ้นต้น /) กับลิงก์ภายนอก (เว็บทางการ)
function SourceChip({ s }: { s: Source }) {
  const cls =
    "inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-mint-soft text-teal-700 border border-mint/30";
  if (s.url.startsWith("/")) {
    return (
      <Link href={s.url} className={cls}>
        🔗 {s.label}
      </Link>
    );
  }
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className={cls}>
      🔗 {s.label} ↗
    </a>
  );
}

export default function AssistantChat() {
  const [messages, setMessages] = useState<BotMsg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);

    const history = messages
      .filter((m) => !m.pending)
      .map((m) => ({ role: m.from === "me" ? ("user" as const) : ("assistant" as const), content: m.text }));

    setMessages((prev) => [
      ...prev,
      { from: "me", text: q },
      { from: "bot", text: "", pending: true },
    ]);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: [...history, { role: "user", content: q }] }),
      });
      const data = (await res.json()) as { answer?: string; sources?: Source[] };
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          from: "bot",
          text: data.answer || "ขออภัย ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งค่ะ",
          sources: data.sources,
        };
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { from: "bot", text: "เชื่อมต่อไม่ได้ในขณะนี้ ลองใหม่อีกครั้งค่ะ" };
        return next;
      });
    }
    setBusy(false);
  }

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* หัวห้อง (desktop) */}
      <div className="hidden lg:flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white flex-none">
        <div className="w-9 h-9 rounded-full bg-petrol grid place-items-center text-lg text-white">🤖</div>
        <div>
          <p className="font-semibold text-gray-800 leading-tight">ผู้ช่วย DentaBridge</p>
          <p className="text-[11px] text-mint">● ตอบอัตโนมัติ · อ้างอิงแหล่งจริงเสมอ</p>
        </div>
      </div>

      {/* ข้อความ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${m.from === "me" ? "" : "space-y-1.5"}`}>
              <div
                className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.from === "me"
                    ? "bg-petrol text-white rounded-br-sm"
                    : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm"
                }`}
              >
                {m.pending ? (
                  <span className="inline-flex gap-1 py-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  </span>
                ) : (
                  m.text
                )}
              </div>
              {m.sources && m.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-gray-400 w-full">แหล่งอ้างอิง:</span>
                  {m.sources.map((s, j) => (
                    <SourceChip key={j} s={s} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-mint hover:text-petrol transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ช่องพิมพ์ */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-none"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำถามเรื่องเว็บ หรือ อย...."
          aria-label="พิมพ์ข้อความ"
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="w-9 h-9 rounded-full bg-petrol disabled:bg-gray-200 disabled:text-gray-400 text-white grid place-items-center flex-none"
          aria-label="ส่ง"
        >
          ➤
        </button>
      </form>
    </>
  );
}
