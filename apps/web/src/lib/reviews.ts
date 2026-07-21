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
  { name: "Dr. Siriporn", rating: 5, text: "Genuine, with complete FDA certification and fast shipping. Very impressed.", date: "2 days ago" },
  { name: "Healthy Teeth Clinic", rating: 5, text: "Good quality and cheaper than what I used to order. Will definitely reorder.", date: "1 week ago" },
  { name: "Dr. Wichai", rating: 4, text: "Good product, but the packaging was slightly dented. Overall okay.", date: "2 weeks ago" },
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
    name: "You (my review)",
    rating,
    text,
    date: "Just now",
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
