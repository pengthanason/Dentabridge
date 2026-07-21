// คลังความรู้ Help Center (โหมด mock) — ทุกคำตอบ "เขียนจากข้อมูลจริง" และแนบแหล่งอ้างอิงเสมอ
// ห้ามเดา/มั่ว: ถ้าไม่ตรงกับคลังนี้ ให้ตอบ fallback ที่ชี้ไปเว็บทางการ (ไม่แต่งคำตอบเอง)

export type Source = { label: string; url: string };
export type KbEntry = {
  id: string;
  keywords: string[];
  answer: string;
  sources: Source[];
};

// แหล่งทางการที่ใช้อ้างอิงเรื่อง อย.
export const OFFICIAL: Record<string, Source> = {
  oryor: { label: "FDA (oryor.com)", url: "https://oryor.com" },
  serial: { label: "FDA product serial check", url: "https://oryor.com/check-product-serial" },
  fda: { label: "Food and Drug Administration", url: "https://www.fda.moph.go.th" },
  mdc: { label: "FDA Medical Device Control Division", url: "https://mdcontrol.fda.moph.go.th" },
  porta: { label: "FDA license lookup system", url: "http://porta.fda.moph.go.th" },
};

export const KB: KbEntry[] = [
  // ── เรื่องเว็บ DentaBridge ──
  {
    id: "how-fda-check",
    keywords: ["check fda", "verify fda", "fda number", "check number", "fda registration", "fake fda", "scan fda"],
    answer:
      "You can verify an FDA number in the “FDA Check” tab of the app — enter the FDA number and tap “Check”, and the system will pull live data from the FDA database. You can also tap the camera button 📷 to scan the number/QR code on the label for automatic entry and verification. There are separate fields for general FDA numbers and for medical device registration numbers.",
    sources: [
      { label: "In-app FDA Check page", url: "/buyer/fda" },
      OFFICIAL.serial,
    ],
  },
  {
    id: "scan-camera",
    keywords: ["scan", "camera", "photo", "qr", "qr code", "barcode", "scanner"],
    answer:
      "On the “FDA Check” page, tap the camera button 📷 next to the input field to open the rear camera. Point it at the FDA number or QR code on the label so it sits within the frame; the system will read the digits (OCR) or decode the QR code, fill them in automatically, and run the check immediately (adequate lighting and a clear label are required).",
    sources: [{ label: "In-app FDA Check page", url: "/buyer/fda" }],
  },
  {
    id: "cart-order",
    keywords: ["cart", "order", "buy", "payment", "pay", "checkout", "purchase"],
    answer:
      "Tap a product to view its details, choose the quantity, and tap “Add to cart”. Then go to the cart page to review the items and tap “Checkout”. You can select the delivery address and payment method during checkout.",
    sources: [
      { label: "Cart", url: "/buyer/cart" },
      { label: "Payment methods", url: "/buyer/setting/payment" },
    ],
  },
  {
    id: "coupon",
    keywords: ["coupon", "code", "discount", "promo", "promotion", "voucher"],
    answer:
      "You can view and claim coupons under Settings → My Coupons, then apply them at checkout by entering or selecting the code on the cart page.",
    sources: [{ label: "My Coupons", url: "/buyer/setting/coupon" }],
  },
  {
    id: "history",
    keywords: ["history", "orders", "past orders", "reorder", "purchase history", "invoice"],
    answer:
      "You can view your purchase history under Settings → Purchase History. Open each order to see the details and tax invoice, tap “Reorder”, or tap “Receive Order” to inspect the items on delivery.",
    sources: [{ label: "Purchase History", url: "/buyer/setting/history" }],
  },
  {
    id: "wishlist",
    keywords: ["wishlist", "favorites", "favorite", "like", "heart", "saved", "bookmark"],
    answer:
      "Tap the heart icon on a product to add it to your wishlist, then view all of them on the “Wishlist” page (heart icon in the top corner).",
    sources: [{ label: "Wishlist", url: "/buyer/wishlist" }],
  },
  {
    id: "receive",
    keywords: ["receive", "receive order", "safety net", "missing items", "lot", "expiry", "inspect goods"],
    answer:
      "When your order arrives, use the “Receive Order (Safety Net)” system from the order history page or a notification. Scan and check each item to confirm it matches the order, and that the lot and expiry date are correct. If there is any problem, you can notify the seller immediately.",
    sources: [{ label: "Purchase History", url: "/buyer/setting/history" }],
  },
  {
    id: "payment-add",
    keywords: ["add card", "credit card", "bank", "promptpay", "payment method", "finance", "payment"],
    answer:
      "You can add a card, bank account, or PromptPay under Settings → Payment Methods. Tap “Add card” and choose your bank from the list.",
    sources: [{ label: "Payment Methods", url: "/buyer/setting/payment" }],
  },
  {
    id: "clinic-tax",
    keywords: ["clinic", "address", "tax invoice", "tax", "clinic info", "delivery address"],
    answer:
      "You can edit your clinic information and delivery address under Settings → Clinic Information, and issue a tax invoice under Settings → Tax Invoice.",
    sources: [
      { label: "Clinic Information", url: "/buyer/setting/clinic" },
      { label: "Tax Invoice", url: "/buyer/setting/tax" },
    ],
  },

  // ── เรื่อง อย. (อ้างอิงเว็บทางการ) ──
  {
    id: "fda-what",
    keywords: ["what is fda", "fda meaning", "fda definition", "food and drug administration"],
    answer:
      "The FDA is Thailand's Food and Drug Administration, the agency that regulates health products such as food, drugs, cosmetics, medical devices, and hazardous substances. Products approved by the FDA carry a registration or notification number (check the latest information on the official website).",
    sources: [OFFICIAL.oryor, OFFICIAL.fda],
  },
  {
    id: "fda-number-format",
    keywords: ["registration number", "13 digits", "number format", "read number", "fda number format", "number meaning"],
    answer:
      "A food registration number has 13 digits in the format X X-X-XXXXX-X-XXXX, indicating the place of manufacture/import and the product sequence. Drugs, cosmetics, and medical devices use different registration/notification number formats. We recommend verifying the actual number through the FDA's verification system (see details at the official link).",
    sources: [OFFICIAL.serial, OFFICIAL.oryor],
  },
  {
    id: "fda-fake",
    keywords: ["fake", "scam", "counterfeit", "fake number", "impersonate", "verify genuine", "trust"],
    answer:
      "You can verify whether an FDA number is genuine or fake directly through the FDA's product verification system, or use the check button in this app, which pulls data from the FDA database. If you find a product falsely claiming an FDA number, report it to the FDA hotline at 1556.",
    sources: [OFFICIAL.serial, OFFICIAL.oryor],
  },
  {
    id: "mdc",
    keywords: ["medical device", "notification", "dental equipment", "dental material", "registration", "device"],
    answer:
      "Medical devices must be registered, notified, or listed in detail with the FDA Medical Device Control Division, depending on their risk level. You can check the registration number in the app under the “Medical device registration number” field, or on the Medical Device Control Division website.",
    sources: [OFFICIAL.mdc, { label: "Check medical devices in-app", url: "/buyer/fda" }],
  },
  {
    id: "complaint",
    keywords: ["complaint", "report tip", "hotline", "1556", "illegal", "report to fda"],
    answer:
      "You can file a complaint or report a tip about illegal health products via the FDA hotline at 1556, or through the FDA's online complaint channels.",
    sources: [OFFICIAL.oryor, OFFICIAL.fda],
  },
];

// คำถามแนะนำ (quick replies)
export const SUGGESTIONS = [
  "How do I check an FDA number?",
  "How do I scan with the camera?",
  "How do I read a 13-digit FDA number?",
  "Add a card / payment method",
  "Check whether an FDA number is fake",
];

// ค้นในคลัง: ให้คะแนนตามจำนวน keyword ที่ตรง — คืน entry ที่ดีที่สุด (หรือ null ถ้าไม่ถึงเกณฑ์)
export function searchKb(query: string): KbEntry | null {
  const q = query.toLowerCase();
  let best: KbEntry | null = null;
  let bestScore = 0;
  for (const e of KB) {
    let score = 0;
    for (const k of e.keywords) {
      if (q.includes(k.toLowerCase())) score += k.length; // keyword ยาว = เฉพาะเจาะจงกว่า
    }
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }
  return bestScore >= 3 ? best : null;
}

export const FALLBACK_ANSWER =
  "Sorry, we don't have verified information on this in the system yet. For accuracy, we recommend checking directly with official sources (we won't guess). Alternatively, ask again about using the app, such as FDA checks, ordering, coupons, or payments.";

export const FALLBACK_SOURCES: Source[] = [OFFICIAL.oryor, OFFICIAL.fda, OFFICIAL.serial];
