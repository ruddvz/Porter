import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GRAPH_VERSION = "v19.0";

/** POST body: { phone_number_id, access_token } — verifies Meta token can read the WhatsApp phone asset. */
export async function POST(req: Request) {
  let body: { phone_number_id?: string; access_token?: string };
  try {
    body = (await req.json()) as { phone_number_id?: string; access_token?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const phoneId = body.phone_number_id?.trim();
  const token = body.access_token?.trim();
  if (!phoneId || !token) {
    return NextResponse.json({ ok: false, error: "phone_number_id and access_token are required" }, { status: 400 });
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(phoneId)}?fields=display_phone_number,verified_name,quality_rating`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = (await res.json()) as {
      display_phone_number?: string;
      verified_name?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error: json.error?.message || `Meta API error (${res.status})`,
      });
    }
    return NextResponse.json({
      ok: true,
      display_phone_number: json.display_phone_number ?? null,
      verified_name: json.verified_name ?? null,
    });
  } catch (e) {
    console.error("[test-meta]", e);
    return NextResponse.json({ ok: false, error: "Network error calling Meta" }, { status: 502 });
  }
}
