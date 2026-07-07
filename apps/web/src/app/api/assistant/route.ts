import { NextResponse } from "next/server";
import { searchKb, FALLBACK_ANSWER, FALLBACK_SOURCES, type Source } from "@/lib/helpKb";

export const runtime = "nodejs";
export const maxDuration = 30;

type ChatMsg = { role: "user" | "assistant"; content: string };
type AssistantReply = { answer: string; sources: Source[]; mode: "mock" | "live" };

// โดเมนทางการที่อนุญาตให้บอตค้น (กันมั่ว — ตอบเฉพาะจากเว็บทางการ)
const ALLOWED_DOMAINS = ["oryor.com", "fda.moph.go.th", "mdcontrol.fda.moph.go.th", "porta.fda.moph.go.th"];

const SYSTEM_PROMPT = `คุณคือ "ผู้ช่วย DentaBridge" — ผู้ช่วย Help Center ของแอปสั่งซื้อวัสดุทันตกรรม B2B สำหรับคลินิกในไทย
หน้าที่: ตอบคำถามเกี่ยวกับการใช้งานแอป และเรื่องเกี่ยวกับ อย. (สำนักงานคณะกรรมการอาหารและยา)

กฎเหล็ก (ห้ามฝ่าฝืน):
1. ห้ามเดาหรือแต่งข้อมูลเด็ดขาด ถ้าไม่รู้หรือค้นไม่พบ ให้บอกตรง ๆ ว่าไม่พบข้อมูลที่ยืนยันได้ และแนะนำให้ติดต่อ อย. สายด่วน 1556
2. เรื่อง อย. / กฎหมาย / ผลิตภัณฑ์สุขภาพ ต้องใช้ web_search ค้นจากเว็บทางการก่อนตอบเสมอ และอ้างอิงลิงก์ที่ค้นเจอ
3. แนบแหล่งอ้างอิง (ลิงก์) ทุกครั้งที่ให้ข้อมูลเชิงข้อเท็จจริง
4. ตอบเป็นภาษาไทย กระชับ สุภาพ เข้าใจง่าย
5. ห้ามให้คำวินิจฉัย/คำแนะนำทางการแพทย์ ให้ชี้ไปแหล่งทางการหรือผู้เชี่ยวชาญ`;

// ── โหมด mock: ตอบจากคลัง FAQ (เขียนจากข้อมูลจริง) + แนบ source เสมอ ──
function mockReply(question: string): AssistantReply {
  const hit = searchKb(question);
  if (hit) return { answer: hit.answer, sources: hit.sources, mode: "mock" };
  return { answer: FALLBACK_ANSWER, sources: FALLBACK_SOURCES, mode: "mock" };
}

// ── โหมดจริง (Gemini): Gemini + Google Search grounding ──
// ลองรุ่นที่ตั้งไว้ก่อน ถ้าโดนจำกัดโควตา/หาไม่เจอ (429/404) ค่อยตกไป flash ที่มี free tier
async function geminiReply(messages: ChatMsg[], apiKey: string): Promise<AssistantReply> {
  const configured = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const models = [...new Set([configured, "gemini-2.5-flash", "gemini-2.0-flash"])];
  let lastErr: unknown = null;
  for (const model of models) {
    try {
      return await geminiCall(messages, apiKey, model);
    } catch (e) {
      lastErr = e;
      const s = String(e);
      // เฉพาะ 429 (โควตา) / 404 (รุ่นไม่มี) เท่านั้นที่ลองรุ่นถัดไป — error อื่นเลิกเลย
      if (!s.includes(" 429") && !s.includes(" 404")) throw e;
    }
  }
  throw lastErr || new Error("gemini failed");
}

async function geminiCall(messages: ChatMsg[], apiKey: string, model: string): Promise<AssistantReply> {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`gemini(${model}) ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> };
    }>;
  };

  const cand = data.candidates?.[0];
  const answer = (cand?.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();

  const sourceMap = new Map<string, Source>();
  for (const g of cand?.groundingMetadata?.groundingChunks || []) {
    if (g.web?.uri && !sourceMap.has(g.web.uri)) {
      sourceMap.set(g.web.uri, { label: g.web.title || g.web.uri, url: g.web.uri });
    }
  }

  if (!answer) return mockReply(messages[messages.length - 1]?.content || "");
  return { answer, sources: Array.from(sourceMap.values()), mode: "live" };
}

// ── โหมดจริง (Claude): web_search จำกัดเฉพาะโดเมนทางการ ──
async function liveReply(messages: ChatMsg[], apiKey: string): Promise<AssistantReply> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ASSISTANT_MODEL || "claude-sonnet-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
          allowed_domains: ALLOWED_DOMAINS,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const data = (await res.json()) as {
    content?: Array<{
      type: string;
      text?: string;
      citations?: Array<{ url?: string; title?: string }>;
    }>;
  };

  let answer = "";
  const sourceMap = new Map<string, Source>();
  for (const block of data.content || []) {
    if (block.type === "text" && block.text) {
      answer += block.text;
      for (const c of block.citations || []) {
        if (c.url && !sourceMap.has(c.url)) {
          sourceMap.set(c.url, { label: c.title || c.url, url: c.url });
        }
      }
    }
  }
  answer = answer.trim();
  if (!answer) return mockReply(messages[messages.length - 1]?.content || "");
  return { answer, sources: Array.from(sourceMap.values()), mode: "live" };
}

export async function POST(req: Request) {
  let messages: ChatMsg[];
  try {
    const body = (await req.json()) as { messages?: ChatMsg[] };
    messages = (body.messages || [])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-10);
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) {
    return NextResponse.json({ error: "empty question" }, { status: 400 });
  }

  // ลำดับ: Gemini → Claude → mock (ตกลงมาเรื่อย ๆ ถ้าล้ม จะไม่มั่ว ใช้ FAQ แทน)
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  try {
    if (geminiKey) return NextResponse.json(await geminiReply(messages, geminiKey));
    if (anthropicKey) return NextResponse.json(await liveReply(messages, anthropicKey));
  } catch (e) {
    console.error("[assistant] live provider failed:", e);
    // ค้นเว็บ/LLM ล้ม → ตกไปใช้ FAQ ที่ยืนยันได้ (ยังไม่มั่ว)
    return NextResponse.json(mockReply(last.content));
  }
  return NextResponse.json(mockReply(last.content));
}

// GET = หน้าตรวจสอบ: เซิร์ฟเวอร์เห็น key ไหม + เรียก provider จริงแล้วได้/พังเพราะอะไร
export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const info: Record<string, unknown> = {
    hasGeminiKey: !!geminiKey,
    hasAnthropicKey: !!anthropicKey,
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    mode: geminiKey ? "gemini" : anthropicKey ? "claude" : "mock",
  };
  const test: ChatMsg[] = [{ role: "user", content: "อย. ย่อมาจากอะไร ตอบสั้น ๆ" }];
  try {
    if (geminiKey) {
      const r = await geminiReply(test, geminiKey);
      info.test = { ok: true, mode: r.mode, sources: r.sources.length, answerPreview: r.answer.slice(0, 100) };
    } else if (anthropicKey) {
      const r = await liveReply(test, anthropicKey);
      info.test = { ok: true, mode: r.mode, sources: r.sources.length, answerPreview: r.answer.slice(0, 100) };
    } else {
      info.test = { ok: false, note: "ยังไม่พบ API key — เซิร์ฟเวอร์ตอบด้วย FAQ (mock)" };
    }
  } catch (e) {
    info.test = { ok: false, error: String(e).slice(0, 400) };
  }
  return NextResponse.json(info);
}
