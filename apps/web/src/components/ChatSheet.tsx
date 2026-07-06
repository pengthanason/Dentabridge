"use client";

import { useState } from "react";

export type ChatMessage = { from: "me" | "them"; text: string };
export type ChatThread = {
  id: string;
  name: string;
  avatar: string;
  last: string;
  time: string;
  messages: ChatMessage[];
};

// แชทจำลอง (mock) — กดดูรายการ/บทสนทนาได้ ยังไม่ต่อ realtime จริง (Phase 5)
export default function ChatSheet({
  open,
  onClose,
  threads,
}: {
  open: boolean;
  onClose: () => void;
  threads: ChatThread[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = threads.find((t) => t.id === activeId) || null;

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40"
        aria-hidden
      />
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl h-[78vh] flex flex-col">
        {/* header */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          {active ? (
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="text-gray-500 text-sm"
            >
              ‹ กลับ
            </button>
          ) : null}
          <h3 className="font-bold text-gray-900 flex-1 truncate">
            {active ? active.name : "ข้อความ"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 text-sm"
          >
            ปิด ✕
          </button>
        </div>

        {/* รายการแชท */}
        {!active && (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <div className="w-11 h-11 rounded-full bg-mint-soft grid place-items-center text-xl flex-none">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {t.name}
                    </p>
                    <span className="text-[10px] text-gray-400 flex-none ml-2">
                      {t.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{t.last}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* บทสนทนา */}
        {active && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              {active.messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      m.from === "me"
                        ? "bg-petrol text-white rounded-br-sm"
                        : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 flex items-center gap-2">
              <input
                disabled
                placeholder="พิมพ์ข้อความ... (เปิดใช้ใน Phase ถัดไป)"
                className="flex-1 bg-gray-100 text-gray-400 rounded-full px-4 py-2 text-sm"
              />
              <button
                type="button"
                disabled
                className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 grid place-items-center"
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
