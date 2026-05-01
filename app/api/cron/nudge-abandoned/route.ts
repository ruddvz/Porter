import { sendMessage } from "@/lib/meta-whatsapp";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import type { Conversation, ConversationContext, Seller } from "@/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const NUDGE_STATES = [
  "collecting_items",
  "collecting_payment_method",
  "collecting_area",
  "collecting_address",
] as const;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServiceRoleClient();
  const errors: string[] = [];
  let nudged = 0;
  let skipped = 0;

  const { data: rows, error } = await supabase
    .from("conversations")
    .select("*")
    .in("state", [...NUDGE_STATES])
    .lt("last_message_at", new Date(Date.now() - 45 * 60 * 1000).toISOString())
    .gt("last_message_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .or("nudge_count.is.null,nudge_count.lt.2");

  if (error) {
    console.error("[cron nudge] query", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const conv of rows ?? []) {
    const c = conv as Conversation;
    const nudgeCount = c.nudge_count ?? 0;
    if (nudgeCount >= 2) {
      skipped++;
      continue;
    }

    const { data: seller, error: sErr } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", c.seller_id)
      .maybeSingle();
    if (sErr || !seller) {
      skipped++;
      continue;
    }
    const s = seller as Seller;
    if (!s.meta_access_token) {
      console.warn("[cron nudge] seller missing meta_access_token", s.id);
      skipped++;
      continue;
    }

    const { data: fresh } = await supabase.from("conversations").select("*").eq("id", c.id).maybeSingle();
    const row = fresh as Conversation | null;
    if (!row || row.last_message_at !== c.last_message_at) {
      skipped++;
      continue;
    }

    const ctx = (row.context as ConversationContext) ?? {};
    const phone = row.customer_phone;
    let message = "";

    if (row.state === "collecting_payment_method") {
      const items = ctx.items ?? [];
      const total = ctx.order_total ?? 0;
      if (!items.length) {
        message = `Hi! 👋 Were you trying to order from ${s.store_name}?
Just send me your grocery list and I'll sort it out! 🛒
Example: '5kg aloo, 2L tael, amul butter'`;
      } else {
        const top = items.slice(0, 3).map((i) => `• ${i.product_name} — ${i.quantity} ${i.unit}`);
        message = `Your order is still waiting! 🛒
${top.join("\n")}
💰 Total: ₹${total}

How do you want to pay?
1️⃣ Online (UPI/Card)
2️⃣ Cash on Delivery`;
      }
    } else if (row.state === "collecting_items") {
      message = `Hi! 👋 Were you trying to order from ${s.store_name}?
Just send me your grocery list and I'll sort it out! 🛒
Example: '5kg aloo, 2L tael, amul butter'`;
    } else if (row.state === "collecting_area") {
      const zones = (s.delivery_zones ?? []).filter(Boolean).join(", ");
      message = `Still there? 📍
Just tell me your delivery area to confirm your order.
${zones || "Send your area name."}`;
    } else if (row.state === "collecting_address") {
      message = `Almost done! 🏠
Just send your building name + flat/house number and your order is confirmed.`;
    } else {
      skipped++;
      continue;
    }

    const ok = await sendMessage(phone, message, s);
    if (ok) {
      const lm = row.last_message_at;
      let q = supabase
        .from("conversations")
        .update({
          nudge_count: nudgeCount + 1,
          last_nudge_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      q = lm == null ? q.is("last_message_at", null) : q.eq("last_message_at", lm);
      const { error: upErr } = await q;
      if (upErr) {
        errors.push(`update failed ${row.id}: ${upErr.message}`);
        continue;
      }
      nudged++;
    } else {
      errors.push(`send failed ${row.id}`);
    }
  }

  return NextResponse.json({ nudged, skipped, errors });
}
