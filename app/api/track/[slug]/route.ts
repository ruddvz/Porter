import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const slug = params.slug?.trim();
  if (!slug || slug.length < 8) {
    return NextResponse.json({ data: null, error: { message: "Not found" } }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_order_by_track_slug", { sl: slug });

  if (error || !data?.length) {
    return NextResponse.json({ data: null, error: { message: "Not found" } }, { status: 404 });
  }

  return NextResponse.json({ data: data[0], error: null });
}
