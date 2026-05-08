import { TrackOrderPoller, type TrackRow } from "@/components/track/TrackOrderPoller";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage({ params }: { params: { slug: string } }) {
  const slug = params.slug?.trim();
  if (!slug || slug.length < 8) notFound();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_order_by_track_slug", { sl: slug });

  if (error || !data?.length) notFound();

  const row = data[0] as TrackRow;

  return <TrackOrderPoller slug={slug} initial={row} />;
}
