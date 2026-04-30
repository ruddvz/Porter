import type { BadgeStatusVariant } from "@/components/ui/Badge";

export type MockLineItem = { name: string; qty: number; unitPrice: number };

export type MockOrder = {
  id: string;
  customerName: string;
  phone: string;
  area: string;
  address: string;
  items: MockLineItem[];
  column: "pending" | "confirmed" | "out" | "delivered";
  orderStatusLabel: string;
  orderStatusVariant: BadgeStatusVariant;
  paymentLabel: string;
  paymentStatusVariant: BadgeStatusVariant;
  paymentOnline: boolean;
  codCollected: boolean;
  razorpayUrl?: string;
  note: string;
  timeline: { key: string; label: string; at: string | null }[];
  createdMinsAgo: number;
};

function line(name: string, qty: number, unitPrice: number): MockLineItem {
  return { name, qty, unitPrice };
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "7f3a9b2c-1a2b-4c3d-8e9f-0123456789ab",
    customerName: "Meera Joshi",
    phone: "+91 98250 11223",
    area: "Manjalpur",
    address: "Sunshine Apt B-204",
    items: [line("Potato", 5, 28), line("Sunflower oil 2L", 2, 220)],
    column: "pending",
    orderStatusLabel: "Pending",
    orderStatusVariant: "unpaid",
    paymentLabel: "COD · Unpaid",
    paymentStatusVariant: "unpaid",
    paymentOnline: false,
    codCollected: false,
    note: "",
    timeline: [
      { key: "recv", label: "Received", at: "10:02" },
      { key: "conf", label: "Confirmed", at: null },
      { key: "paid", label: "Paid", at: null },
      { key: "disp", label: "Dispatched", at: null },
      { key: "del", label: "Delivered", at: null },
    ],
    createdMinsAgo: 18,
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    customerName: "Ravi Shah",
    phone: "+91 98765 00011",
    area: "Tarsali",
    address: "Row house 12, Lane 4",
    items: [line("Amul butter 200g", 2, 56), line("Milk 1L", 3, 30)],
    column: "confirmed",
    orderStatusLabel: "Confirmed",
    orderStatusVariant: "paid",
    paymentLabel: "Online · Paid",
    paymentStatusVariant: "paid",
    paymentOnline: true,
    codCollected: false,
    razorpayUrl: "https://rzp.io/i/example-link",
    note: "Ring doorbell twice",
    timeline: [
      { key: "recv", label: "Received", at: "09:15" },
      { key: "conf", label: "Confirmed", at: "09:18" },
      { key: "paid", label: "Paid", at: "09:20" },
      { key: "disp", label: "Dispatched", at: null },
      { key: "del", label: "Delivered", at: null },
    ],
    createdMinsAgo: 45,
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    customerName: "Kiran Desai",
    phone: "+91 99000 44321",
    area: "Maneja",
    address: "Green Park C-101",
    items: [line("Wheat atta 10kg", 1, 420)],
    column: "out",
    orderStatusLabel: "Out for delivery",
    orderStatusVariant: "dispatched",
    paymentLabel: "Online · Paid",
    paymentStatusVariant: "paid",
    paymentOnline: true,
    codCollected: false,
    note: "",
    timeline: [
      { key: "recv", label: "Received", at: "08:40" },
      { key: "conf", label: "Confirmed", at: "08:42" },
      { key: "paid", label: "Paid", at: "08:45" },
      { key: "disp", label: "Dispatched", at: "11:10" },
      { key: "del", label: "Delivered", at: null },
    ],
    createdMinsAgo: 140,
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    customerName: "Anita Mehta",
    phone: "+91 91234 55667",
    area: "Manjalpur",
    address: "Shanti Niketan 4",
    items: [line("Sugar 5kg", 1, 220), line("Tea 500g", 1, 180)],
    column: "delivered",
    orderStatusLabel: "Delivered",
    orderStatusVariant: "delivered",
    paymentLabel: "COD · Paid",
    paymentStatusVariant: "paid",
    paymentOnline: false,
    codCollected: true,
    note: "",
    timeline: [
      { key: "recv", label: "Received", at: "Yesterday 18:00" },
      { key: "conf", label: "Confirmed", at: "Yesterday 18:05" },
      { key: "paid", label: "Paid", at: "Yesterday 18:08" },
      { key: "disp", label: "Dispatched", at: "Yesterday 19:00" },
      { key: "del", label: "Delivered", at: "Yesterday 19:45" },
    ],
    createdMinsAgo: 2000,
  },
];

export function orderSubtotal(o: MockOrder): number {
  return o.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
}
