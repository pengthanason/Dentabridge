"use client";

import { useEffect, useState } from "react";

export type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  text: string;
  date: string;
};

// คะแนนคงที่ต่อสินค้า (mock deterministic จากชื่อ)
export function ratingFor(key: string): { rating: number; count: number } {
  const h = [...key].reduce((s, c) => s + c.charCodeAt(0), 0);
  const rating = 4 + (h % 10) / 10; // 4.0 - 4.9
  const count = 8 + (h % 180);
  return { rating: Math.round(rating * 10) / 10, count };
}

const SAMPLE: Omit<Review, "id" | "productId">[] = [
  { name: "ทพญ. ศิริพร", rating: 5, text: "ของแท้ มีใบรับรอง อย. ครบ ส่งไว ประทับใจค่ะ", date: "2 วันก่อน" },
  { name: "คลินิกฟันดี", rating: 5, text: "คุณภาพดี ราคาถูกกว่าที่เคยสั่ง สั่งซ้ำแน่นอน", date: "1 สัปดาห์ก่อน" },
  { name: "ทพ. วิชัย", rating: 4, text: "สินค้าดี แต่แพ็คเกจบุบเล็กน้อย โดยรวมโอเค", date: "2 สัปดาห์ก่อน" },
];

export function sampleReviews(productId: string): Review[] {
  return SAMPLE.map((r, i) => ({ ...r, id: "s" + i, productId }));
}

const KEY = "db_reviews";
function allUserReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addReview(productId: string, rating: number, text: string) {
  const list = allUserReviews();
  const r: Review = {
    id: "u" + list.length,
    productId,
    name: "คุณ (รีวิวของฉัน)",
    rating,
    text,
    date: "เมื่อสักครู่",
  };
  localStorage.setItem(KEY, JSON.stringify([r, ...list]));
  window.dispatchEvent(new Event("db-reviews-changed"));
}

// รวมรีวิวตัวอย่าง + รีวิวที่ผู้ใช้เพิ่ม
export function useReviews(productId: string): Review[] {
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    const load = () =>
      setReviews([
        ...allUserReviews().filter((r) => r.productId === productId),
        ...sampleReviews(productId),
      ]);
    load();
    window.addEventListener("db-reviews-changed", load);
    return () => window.removeEventListener("db-reviews-changed", load);
  }, [productId]);
  return reviews;
}
