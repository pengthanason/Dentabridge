"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AssistantChat from "@/components/AssistantChat";
import { IconChat, IconBuilding } from "@/components/Icons";

type Msg = { from: "me" | "them"; text: string };
type Thread = { id: string; name: string; avatar: ReactNode; last: string; time: string; messages: Msg[] };

const THREADS: Thread[] = [
  {
    id: "c1",
    name: "Dental Vision",
    avatar: <IconBuilding className="w-6 h-6" />,
    last: "Your order is confirmed and will ship tomorrow.",
    time: "10:24",
    messages: [
      { from: "them", text: "Hello, feel free to ask about any product you're interested in." },
      { from: "me", text: "What colors do the O-Rings come in?" },
      { from: "them", text: "All 8 colors are available, minimum order 1 pack, with complete FDA certification." },
      { from: "me", text: "Alright, I'll order 2 packs." },
      { from: "them", text: "Noted. Your order is confirmed and will ship tomorrow." },
    ],
  },
  {
    id: "c2",
    name: "MedSupply TH",
    avatar: <IconBuilding className="w-6 h-6" />,
    last: "Thank you for your business. 🙏",
    time: "Yesterday",
    messages: [
      { from: "me", text: "What's the expiry year for the new nitrile gloves lot?" },
      { from: "them", text: "This lot expires in 2028." },
      { from: "them", text: "Thank you for your business. 🙏" },
    ],
  },
];

export default function ChatPage() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const isAssistant = activeId === "assistant";
  const active = THREADS.find((t) => t.id === activeId) || null;

  function back() {
    // มือถือ + กำลังดูแชท → กลับไปรายการ; นอกนั้น → ออกไปหน้า Marketplace
    if ((active || isAssistant) && typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setActiveId(null);
    } else {
      router.push("/buyer");
    }
  }

  return (
    <div className="flex flex-col bg-gray-50 h-[calc(100dvh-5rem)]">
      <header className="bg-petrol text-white flex-none">
        <div className="max-w-md lg:max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={back} className="text-lg" aria-label="Back">
            ‹
          </button>
          <h1 className="font-semibold flex-1 truncate">
            <span className="lg:hidden">{isAssistant ? "DentaBridge Assistant" : active ? active.name : "Messages"}</span>
            <span className="hidden lg:inline">Messages</span>
          </h1>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-md lg:max-w-5xl mx-auto w-full">
        {/* รายการแชท (ซ้าย) */}
        <aside
          className={`w-full lg:w-80 lg:flex-none lg:border-r border-gray-200 overflow-y-auto bg-white ${
            active || isAssistant ? "hidden lg:block" : "block"
          }`}
        >
          {/* ผู้ช่วย AI (ปักหมุดบนสุด) */}
          <button
            type="button"
            onClick={() => setActiveId("assistant")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-100 ${
              isAssistant ? "lg:bg-mint-soft" : "bg-mint-soft/40"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-petrol grid place-items-center text-white flex-none"><IconChat className="w-6 h-6" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-gray-800 truncate flex items-center gap-1.5">
                  DentaBridge Assistant
                  <span className="text-[9px] font-bold bg-petrol text-white px-1.5 py-0.5 rounded">AI</span>
                </p>
                <span className="text-[10px] text-mint ml-2 flex-none">Online</span>
              </div>
              <p className="text-xs text-gray-500 truncate">Ask about the app &amp; FDA · cites real sources</p>
            </div>
          </button>

          {THREADS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 ${
                t.id === activeId ? "lg:bg-mint-soft" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-mint-soft text-petrol grid place-items-center flex-none">
                {t.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-800 truncate">{t.name}</p>
                  <span className="text-[10px] text-gray-400 ml-2 flex-none">{t.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{t.last}</p>
              </div>
            </button>
          ))}
        </aside>

        {/* สนทนา (ขวา) */}
        <section className={`w-full lg:flex-1 flex-col ${active || isAssistant ? "flex" : "hidden lg:flex"}`}>
          {isAssistant ? (
            <AssistantChat />
          ) : active ? (
            <>
              {/* ชื่อคู่สนทนา (โชว์บน desktop) */}
              <div className="hidden lg:flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white flex-none">
                <div className="w-9 h-9 rounded-full bg-mint-soft text-petrol grid place-items-center">{active.avatar}</div>
                <p className="font-semibold text-gray-800">{active.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {active.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
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

              <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2 flex-none">
                <input
                  disabled
                  placeholder="Type a message... (available in the next phase)"
                  className="flex-1 bg-gray-100 text-gray-400 rounded-full px-4 py-2 text-sm"
                  aria-label="Type a message"
                />
                <button type="button" disabled className="w-11 h-11 rounded-full bg-gray-200 text-gray-400 grid place-items-center">
                  ➤
                </button>
              </div>
            </>
          ) : (
            // ว่าง (เฉพาะ desktop) — ยังไม่เลือกแชท
            <div className="flex-1 grid place-items-center text-center text-gray-400">
              <div>
                <div className="w-16 h-16 rounded-full bg-mint-soft text-petrol grid place-items-center mx-auto mb-2">
                  <IconChat className="w-8 h-8" />
                </div>
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
