"use client";

import { useState } from "react";
import Link from "next/link";

type Msg = { from: "me" | "them"; text: string };
type Thread = { id: string; name: string; avatar: string; last: string; time: string; messages: Msg[] };

const THREADS: Thread[] = [
  {
    id: "c1",
    name: "Dental Vision",
    avatar: "🏢",
    last: "ยืนยันออเดอร์แล้วค่ะ จัดส่งพรุ่งนี้",
    time: "10:24",
    messages: [
      { from: "them", text: "สวัสดีค่ะ สนใจสินค้าตัวไหนสอบถามได้เลยนะคะ" },
      { from: "me", text: "ยาง O-Ring มีสีอะไรบ้างครับ" },
      { from: "them", text: "มีครบ 8 สีเลยค่ะ สั่งขั้นต่ำ 1 แพ็ค มีใบรับรอง อย. ครบ" },
      { from: "me", text: "โอเคครับ สั่ง 2 แพ็ค" },
      { from: "them", text: "รับทราบค่ะ ยืนยันออเดอร์แล้ว จัดส่งพรุ่งนี้" },
    ],
  },
  {
    id: "c2",
    name: "MedSupply TH",
    avatar: "🏭",
    last: "ขอบคุณที่อุดหนุนค่ะ 🙏",
    time: "เมื่อวาน",
    messages: [
      { from: "me", text: "ถุงมือไนไตรล์ล็อตใหม่ Exp ปีไหนครับ" },
      { from: "them", text: "ล็อตนี้ Exp 2028 ค่ะ" },
      { from: "them", text: "ขอบคุณที่อุดหนุนค่ะ 🙏" },
    ],
  },
];

export default function ChatPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = THREADS.find((t) => t.id === activeId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-petrol text-white sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          {active ? (
            <button type="button" onClick={() => setActiveId(null)} className="text-lg" aria-label="กลับ">
              ‹
            </button>
          ) : (
            <Link href="/buyer" className="text-lg" aria-label="กลับ">
              ‹
            </Link>
          )}
          <h1 className="font-semibold flex-1 truncate">{active ? active.name : "ข้อความ"}</h1>
        </div>
      </header>

      {/* รายการแชท */}
      {!active && (
        <div className="max-w-md mx-auto w-full flex-1 divide-y divide-gray-100 bg-white">
          {THREADS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-mint-soft grid place-items-center text-xl flex-none">
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
        </div>
      )}

      {/* บทสนทนา */}
      {active && (
        <>
          <div className="max-w-md mx-auto w-full flex-1 overflow-y-auto p-4 space-y-2">
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
          <div className="max-w-md mx-auto w-full p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              disabled
              placeholder="พิมพ์ข้อความ... (เปิดใช้ใน Phase ถัดไป)"
              className="flex-1 bg-gray-100 text-gray-400 rounded-full px-4 py-2 text-sm"
              aria-label="พิมพ์ข้อความ"
            />
            <button type="button" disabled className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 grid place-items-center">
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
}
