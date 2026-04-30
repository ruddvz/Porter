/** Admin + platform mock data for static UI (replace with Supabase when backend is live). */

export type AdminSeller = {
  id: string;
  storeName: string;
  ownerEmail: string;
  city: string;
  whatsapp: string;
  plan: "starter" | "growth";
  status: "active" | "inactive";
  ordersAllTime: number;
  revenueAllTime: number;
  joinedAt: string;
  deliveryZones: string[];
  metaPhoneOk: boolean;
  metaTokenOk: boolean;
  razorpayKeyOk: boolean;
  razorpaySecretOk: boolean;
};

export type AdminOrder = {
  id: string;
  sellerId: string;
  storeName: string;
  customerName: string;
  phone: string;
  total: number;
  payment: string;
  status: string;
  createdAt: string;
};

export type AdminConversation = {
  id: string;
  customerPhone: string;
  state: string;
  lastMessageAt: string;
  nudgeCount: number;
};

export type PlatformEventRow = {
  id: string;
  at: string;
  adminEmail: string;
  eventType: string;
  sellerName: string | null;
};

export const MOCK_SELLERS: AdminSeller[] = [
  {
    id: "seller-1",
    storeName: "Krishna General",
    ownerEmail: "owner1@example.com",
    city: "Vadodara",
    whatsapp: "+91 98765 11111",
    plan: "growth",
    status: "active",
    ordersAllTime: 1240,
    revenueAllTime: 4200000,
    joinedAt: "2025-01-12",
    deliveryZones: ["Manjalpur", "Tarsali"],
    metaPhoneOk: true,
    metaTokenOk: true,
    razorpayKeyOk: true,
    razorpaySecretOk: true,
  },
  {
    id: "seller-2",
    storeName: "Shreeji Kirana",
    ownerEmail: "owner2@example.com",
    city: "Surat",
    whatsapp: "+91 98765 22222",
    plan: "starter",
    status: "active",
    ordersAllTime: 340,
    revenueAllTime: 890000,
    joinedAt: "2025-03-01",
    deliveryZones: ["Varachha"],
    metaPhoneOk: true,
    metaTokenOk: false,
    razorpayKeyOk: true,
    razorpaySecretOk: false,
  },
  {
    id: "seller-3",
    storeName: "Patel Fresh Mart",
    ownerEmail: "owner3@example.com",
    city: "Ahmedabad",
    whatsapp: "+91 98765 33333",
    plan: "starter",
    status: "inactive",
    ordersAllTime: 89,
    revenueAllTime: 210000,
    joinedAt: "2024-11-20",
    deliveryZones: ["Navrangpura"],
    metaPhoneOk: false,
    metaTokenOk: false,
    razorpayKeyOk: false,
    razorpaySecretOk: false,
  },
];

export const MOCK_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: "ord-a1",
    sellerId: "seller-1",
    storeName: "Krishna General",
    customerName: "Meera Joshi",
    phone: "+91 98250 11223",
    total: 330,
    payment: "COD",
    status: "Pending",
    createdAt: "2026-04-30T10:00:00Z",
  },
  {
    id: "ord-a2",
    sellerId: "seller-2",
    storeName: "Shreeji Kirana",
    customerName: "Ravi Shah",
    phone: "+91 98765 00011",
    total: 120,
    payment: "Razorpay",
    status: "Delivered",
    createdAt: "2026-04-29T18:30:00Z",
  },
];

export const MOCK_CONVERSATIONS: Record<string, AdminConversation[]> = {
  "seller-1": [
    {
      id: "c1",
      customerPhone: "+91 90000 11111",
      state: "collecting_payment_method",
      lastMessageAt: "2026-04-30T09:00:00Z",
      nudgeCount: 0,
    },
    {
      id: "c2",
      customerPhone: "+91 90000 22222",
      state: "complete",
      lastMessageAt: "2026-04-29T20:00:00Z",
      nudgeCount: 1,
    },
  ],
  "seller-2": [
    {
      id: "c3",
      customerPhone: "+91 90000 33333",
      state: "collecting_items",
      lastMessageAt: "2026-04-30T08:00:00Z",
      nudgeCount: 0,
    },
  ],
};

export const MOCK_PLATFORM_EVENTS: PlatformEventRow[] = [
  {
    id: "e1",
    at: "2026-04-30T07:00:00Z",
    adminEmail: "you@porter.app",
    eventType: "plan_changed",
    sellerName: "Krishna General",
  },
  {
    id: "e2",
    at: "2026-04-29T15:00:00Z",
    adminEmail: "you@porter.app",
    eventType: "seller_deactivated",
    sellerName: "Patel Fresh Mart",
  },
];

export const MOCK_DAILY_ORDERS = Array.from({ length: 30 }, (_, i) => ({
  day: `Apr ${i + 1}`,
  orders: 40 + Math.round(25 * Math.sin(i / 3) + Math.random() * 15),
}));

export const MOCK_SELLER_REVENUE = MOCK_SELLERS.slice(0, 5).map((s) => ({
  name: s.storeName.slice(0, 12),
  revenue: Math.round(s.revenueAllTime / 10000),
}));

export const MOCK_PAYMENT_SPLIT = [
  { name: "Razorpay", value: 58, fill: "var(--porter-green-500, #25D366)" },
  { name: "COD", value: 32, fill: "var(--porter-orange-500, #FF6B35)" },
  { name: "Manual UPI", value: 10, fill: "var(--porter-status-cod, #F59E0B)" },
];

export const MOCK_SIGNUPS = Array.from({ length: 90 }, (_, i) => ({
  day: i,
  count: Math.max(0, Math.round(2 + Math.random() * 4 - i / 40)),
}));

export type AdminProductRow = { name: string; price: number; inStock: boolean };

export const MOCK_PRODUCTS_BY_SELLER: Record<string, AdminProductRow[]> = {
  "seller-1": [
    { name: "Potato", price: 28, inStock: true },
    { name: "Sunflower oil 2L", price: 220, inStock: true },
    { name: "Amul butter", price: 56, inStock: false },
  ],
  "seller-2": [{ name: "Wheat atta 10kg", price: 420, inStock: true }],
  "seller-3": [],
};
