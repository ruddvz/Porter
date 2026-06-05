import { TrackOrderView } from "@/components/tracking/TrackOrderView";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.trim();
  if (!slug || slug.length < 8) notFound();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_order_by_track_slug", { sl: slug });

  if (error || !data?.length) notFound();

  return <TrackOrderView row={data[0]} />;
}
