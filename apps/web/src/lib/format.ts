// ฟอร์แมตกลาง — ใช้ร่วมทุกหน้า (เลี่ยงนิยาม money ซ้ำในแต่ละไฟล์)
export const money = (n: number) => "฿" + n.toLocaleString("th-TH");
