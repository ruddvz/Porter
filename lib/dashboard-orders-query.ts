import type { OrderStatus } from "@/types";

/** Statuses shown on the live board (excludes long-tail history). */
export const LIVE_BOARD_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "paid",
  "out_for_delivery",
];

export const LIVE_BOARD_FETCH_LIMIT = 120;

/** Recent delivered/cancelled for same-day context on the board. */
export const LIVE_BOARD_RECENT_TERMINAL_DAYS = 2;
