import { sendMessage } from "@/lib/meta-whatsapp";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: "Unauthorized", code: "401" } }, { status: 401 });

  let body: { to?: string; message?: string };
  try {
    body = (await req.json()) as { to?: string; message?: string };
  } catch {
    return NextResponse.json({ data: null, error: { message: "Invalid JSON", code: "400" } }, { status: 400 });
  }

  const to = typeof body.to === "string" ? body.to.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!to || !message) {
    return NextResponse.json({ data: null, error: { message: "to and message are required", code: "400" } }, { status: 400 });
  }

  const { data: seller } = await supabase.from("sellers").select("*").eq("user_id", user.id).maybeSingle();
  if (!seller) return NextResponse.json({ data: null, error: { message: "No seller profile", code: "400" } }, { status: 400 });

  const ok = await sendMessage(to, message, seller);
  if (!ok) {
    return NextResponse.json(
      { data: null, error: { message: "WhatsApp send failed — check Meta credentials", code: "send_failed" } },
      { status: 502 },
    );
  }

  return NextResponse.json({ data: { ok: true }, error: null });
}
