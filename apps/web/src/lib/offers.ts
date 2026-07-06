"use client";

import { useEffect, useState } from "react";

// ข้อเสนอราคา (make an offer / bidding) — mock เก็บใน localStorage
export type Offer = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  qty: number;
  status: "pending" | "accepted" | "declined";
  date: string;
};

const KEY = "db_offers";

export function getOffers(): Offer[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addOffer(o: Omit<Offer, "id" | "status" | "date">) {
  const list = getOffers();
  const offer: Offer = {
    ...o,
    id: "of" + list.length + "_" + o.productId.slice(0, 4),
    status: "pending",
    date: new Date().toLocaleDateString("th-TH"),
  };
  localStorage.setItem(KEY, JSON.stringify([offer, ...list]));
  window.dispatchEvent(new Event("db-offers-changed"));
}

export function useOffers(): Offer[] {
  const [offers, setOffers] = useState<Offer[]>([]);
  useEffect(() => {
    setOffers(getOffers());
    const h = () => setOffers(getOffers());
    window.addEventListener("db-offers-changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("db-offers-changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return offers;
}
