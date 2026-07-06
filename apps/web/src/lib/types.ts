export type Role = "buyer" | "seller" | "admin";
export type AcctStatus = "pending" | "active" | "suspended";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

export type Category = {
  id: number;
  slug: string;
  name_th: string;
  sort: number;
};

export type Product = {
  id: string;
  seller_id: string | null;
  name: string;
  category_id: number | null;
  brand: string | null;
  description: string | null;
  price: number;
  fda_no: string | null;
  fda_verified: boolean;
  image_emoji: string | null;
  image_url: string | null;
  stock: number;
  active: boolean;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

export type Profile = {
  id: string;
  role: Role;
  email: string | null;
  phone: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  status: AcctStatus;
  verified: boolean;
  created_at: string;
};
