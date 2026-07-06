import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

// Web Service ทางการของ อย. (SOAP)
const WS = "http://porta.fda.moph.go.th/FDA_SEARCH_ALL/WS_LICENSE_SEARCH.asmx";

// op เฉพาะประเภท (เร็วมาก ~0.1s ต่างจาก GET_DATA_ALL ที่สแกนทั้งฐาน ช้า 30s)
const TYPE_OPS = [
  "GET_DATA_FOOD",
  "GET_DATA_DRUG",
  "GET_DATA_CMT",
  "GET_DATA_MDC",
  "GET_DATA_HERB",
  "GET_DATA_TXC",
];

type Row = {
  lcnno: string;
  nameTh: string;
  nameEn: string;
  licensee: string;
  productType: string;
  type: string;
  status: string;
  url: string;
};

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string)
  );
}
function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}
function tag(block: string, name: string) {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : "";
}

// คืน ok=false เมื่อ "ต่อไม่ติด/timeout" (ต่างจากตอบแล้วไม่มีผล)
async function callOp(op: string, q: string): Promise<{ ok: boolean; rows: Row[] }> {
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body><${op} xmlns="http://tempuri.org/"><DATAS>${escapeXml(q)}</DATAS></${op}></soap:Body>
</soap:Envelope>`;
  try {
    const res = await fetch(WS, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `http://tempuri.org/${op}`,
        "User-Agent": "Mozilla/5.0 (DentaBridge FDA check)",
      },
      body: envelope,
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return { ok: false, rows: [] };
    const xml = await res.text();
    const blocks = (xml.match(/<Table1[\s\S]*?<\/Table1>/g) || []).slice(0, 25);
    const rows = blocks
      .map((b) => ({
        lcnno: tag(b, "lcnno"),
        nameTh: tag(b, "productha"),
        nameEn: tag(b, "produceng"),
        licensee: tag(b, "licen"),
        productType: tag(b, "typepro"),
        type: tag(b, "typeallow"),
        status: tag(b, "cncnm"),
        url: tag(b, "URLs_NEW"),
      }))
      .filter((r) => r.nameTh || r.nameEn || r.lcnno);
    return { ok: true, rows };
  } catch {
    return { ok: false, rows: [] };
  }
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const type = req.nextUrl.searchParams.get("type") || "all";
  if (!q) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });

  try {
    let rows: Row[];
    let anyOk = false;
    if (type === "mdc") {
      let r = await callOp("GET_DATA_MDC", q);
      if (!r.ok) r = await callOp("GET_DATA_MDC", q); // retry 1 ครั้ง
      anyOk = r.ok;
      rows = r.rows;
    } else {
      // ยิงทุกประเภทพร้อมกัน + soft-deadline: รวมผลจาก op ที่ตอบทันใน 7s
      // ไม่รอตัวที่ค้าง (เช่น GET_DATA_DRUG อาจช้ามาก)
      const collected: Row[] = [];
      const ps = TYPE_OPS.map((op) =>
        callOp(op, q).then((r) => {
          if (r.ok) anyOk = true;
          collected.push(...r.rows);
        })
      );
      const deadline = new Promise<void>((r) => setTimeout(r, 7000));
      await Promise.race([Promise.allSettled(ps), deadline]);
      rows = collected;
    }

    // ต่อ อย. ไม่ติดเลย (ไม่มี op ไหนตอบสำเร็จ) → แจ้งว่าเชื่อมไม่ได้ (ไม่ใช่ "ไม่พบ")
    if (!anyOk && rows.length === 0) {
      return NextResponse.json({ ok: false, error: "upstream" }, { status: 503 });
    }

    // dedupe + จัดอันดับตรงเป๊ะก่อน
    const seen = new Set<string>();
    const results = rows
      .filter((r) => {
        const key = r.lcnno || r.nameTh;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => Number(b.lcnno === q) - Number(a.lcnno === q))
      .slice(0, 20);

    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }
}
