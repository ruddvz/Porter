export type PublicStore = {
  id: string;
  store_name: string;
  store_slug: string;
  store_description: string | null;
  logo_url: string | null;
  city: string | null;
  delivery_zones: string[] | null;
  min_order_amount: number | null;
  delivery_fee: number | null;
  cod_enabled: boolean;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
};

export type PublicProduct = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  unit: string;
  description: string | null;
  image_url: string | null;
  stock_quantity: number;
  in_stock: boolean;
};

export type FulfillmentType = "pickup" | "delivery";
export type StorefrontPaymentMethod = "cod" | "razorpay";
