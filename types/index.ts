/** Shared DB row types for Porter (Supabase). */

export type SellerPlan = "starter" | "growth";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "paid"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "razorpay" | "upi_manual" | "cod";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "refunded"
  | "cod_pending"
  | "cod_collected";

export type ConversationState =
  | "collecting_items"
  | "collecting_payment_method"
  | "collecting_area"
  | "collecting_address"
  | "awaiting_payment"
  | "awaiting_upi_confirmation"
  | "complete"
  | "failed";

export type BotLanguagePreference = "auto" | "gujarati" | "hindi" | "english";

/** Per-day hours: { "mon": { open: "09:00", close: "21:00" }, ... } */
export type WorkingHoursMap = Record<string, { open: string; close: string } | null | undefined>;

export interface Seller {
  id: string;
  user_id: string;
  store_name: string;
  whatsapp_number: string;
  city: string | null;
  delivery_zones: string[] | null;
  /** IANA timezone for working-hours checks (default Asia/Kolkata in code). */
  timezone?: string | null;
  /** Minimum order amount (₹) before checkout — optional. */
  min_order_amount?: number | null;
  /** Flat delivery fee (₹) shown on receipt — optional. */
  delivery_fee?: number | null;
  /** Reply when customer writes outside working hours. */
  off_hours_message?: string | null;
  upi_id: string | null;
  razorpay_key_id: string | null;
  razorpay_key_secret: string | null;
  plan: SellerPlan;
  is_active: boolean;
  created_at: string;
  meta_phone_number_id: string | null;
  meta_access_token: string | null;
  meta_access_token_enc?: string | null;
  cod_enabled: boolean;
  bot_intro_message?: string | null;
  bot_language?: BotLanguagePreference | string | null;
  razorpay_test_mode?: boolean | null;
  store_description?: string | null;
  logo_url?: string | null;
  bot_out_of_stock_message?: string | null;
  bot_order_confirmation_template?: string | null;
  working_hours?: WorkingHoursMap | null;
  upi_id_enc?: string | null;
  razorpay_key_id_enc?: string | null;
  razorpay_key_secret_enc?: string | null;
  /** Award ₹1 loyalty point per ₹ of delivered orders when enabled (Growth). */
  loyalty_points_enabled?: boolean | null;
  /** Optional referral code for Growth stores. */
  referral_code?: string | null;
  store_slug?: string | null;
  whatsapp_provider?: "meta" | "openwa" | string | null;
  openwa_session_id?: string | null;
  openwa_session_status?: string | null;
  pickup_enabled?: boolean | null;
  delivery_enabled?: boolean | null;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  aliases: string[] | null;
  category: string | null;
  price: number;
  unit: string;
  in_stock: boolean;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  stock_quantity?: number;
  /** Lower values appear first when using custom sort / drag reorder (Plan0 §5). */
  sort_order?: number;
  created_at: string;
}

export interface Customer {
  id: string;
  seller_id: string;
  phone_number: string;
  name: string | null;
  default_area: string | null;
  default_address: string | null;
  order_count: number;
  loyalty_points?: number;
  referred_by_code?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  seller_id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string;
  delivery_area: string | null;
  delivery_address: string | null;
  total_amount: number | null;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus | null;
  razorpay_payment_link_id: string | null;
  razorpay_payment_link_url: string | null;
  razorpay_order_id?: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
  /** Unguessable slug for /track/[slug] public status page. */
  track_public_slug?: string | null;
  /** Optional next-day / scheduled delivery window. */
  scheduled_for?: string | null;
  rider_label?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  seller_id?: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

export interface Conversation {
  id: string;
  seller_id: string;
  customer_phone: string;
  state: ConversationState;
  context: ConversationContext | null;
  last_message_at: string | null;
  created_at: string;
  nudge_count?: number | null;
  last_nudge_at?: string | null;
}

/** Row for seller conversations list (dashboard). */
export type ConversationListRow = {
  id: string;
  customer_phone: string;
  state: string;
  last_message_at: string | null;
  customer_name: string | null;
};

/** Persisted WhatsApp thread line (Plan0 §7) — see migration `013_conversation_messages.sql`. */
export interface ConversationMessage {
  id: string;
  conversation_id: string;
  seller_id: string;
  direction: "in" | "out";
  body: string;
  created_at: string;
}

/** JSON stored in conversations.context during the bot flow. */
export interface ConversationContext {
  items?: ParsedLineItem[];
  payment_method?: PaymentMethod;
  area?: string;
  address?: string;
  order_total?: number;
  /** Set after order row exists */
  order_id?: string;
  razorpay_order_id?: string;
  /** When bot_language is auto: first detected customer language for consistent replies */
  detected_reply_lang?: "gujarati" | "hindi" | "english";
  /** Customer-requested delivery time (ISO string), from phrases like "kal subah". */
  scheduled_for?: string;
  /** Referral code detected in customer message (Growth store). */
  referral_code?: string;
}

export interface ParsedLineItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

/** Raw Gemini output for full-order parse (before fuzzy product match). */
export interface ParsedFullOrderItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface FullOrderParse {
  items: ParsedFullOrderItem[];
  area: string | null;
  address: string | null;
  paymentMethod: "razorpay" | "cod" | "upi_manual" | null;
  confidence: "full" | "partial" | "items_only";
}

export type MessageIntent = "order" | "greeting" | "question" | "other";

export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role: "super_admin" | "support";
  created_at: string;
}

export interface PlatformEvent {
  id: string;
  admin_id: string | null;
  event_type: string;
  target_seller_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface PlatformSettings {
  id: number;
  starter_product_limit: number;
  starter_orders_per_month: number;
  starter_analytics_days: number;
  growth_analytics_days: number;
  announcement: string | null;
  updated_at: string;
}

export interface MetaWebhookPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      value?: {
        messaging_product?: string;
        metadata?: { phone_number_id?: string; display_phone_number?: string };
        messages?: Array<{
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
        }>;
        statuses?: unknown[];
      };
      field?: string;
    }>;
  }>;
}
