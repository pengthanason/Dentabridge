import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Web Service ทางการของ อย. (SOAP) — สืบค้นผลิตภัณฑ์เครื่องมือแพทย์
const WS = "http://porta.fda.moph.go.th/FDA_SEARCH_ALL/WS_LICENSE_SEARCH.asmx";

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

// op ตามประเภท: all = เลข อย. ทุกประเภท, mdc = เลขจดแจ้งเครื่องมือแพทย์
const OPS: Record<string, string> = {
  all: "GET_DATA_ALL",
  mdc: "GET_DATA_MDC",
};

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const type = req.nextUrl.searchParams.get("type") || "all";
  const op = OPS[type] || OPS.all;
  if (!q) return NextResponse.json({ ok: false, error: "empty" }, { status: 400 });

  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${op} xmlns="http://tempuri.org/"><DATAS>${escapeXml(q)}</DATAS></${op}>
  </soap:Body>
</soap:Envelope>`;

  try {
    const res = await fetch(WS, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `http://tempuri.org/${op}`,
      },
      body: envelope,
      signal: AbortSignal.timeout(15000),
    });
    const xml = await res.text();
    const blocks = xml.match(/<Table1[\s\S]*?<\/Table1>/g) || [];
    const results = blocks
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
      .filter((r) => r.lcnno)
      .slice(0, 20);

    // จัดอันดับ: ตรงเป๊ะขึ้นก่อน
    results.sort((a, b) => Number(b.lcnno === q) - Number(a.lcnno === q));
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream" }, { status: 502 });
  }
}
