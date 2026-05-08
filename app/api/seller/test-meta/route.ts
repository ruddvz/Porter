import { apiErr, apiOk } from "@/lib/api-json";

export const runtime = "nodejs";

const GRAPH_VERSION = "v19.0";

/** POST body: { phone_number_id, access_token } — verifies Meta token can read the WhatsApp phone asset. */
export async function POST(req: Request) {
  let body: { phone_number_id?: string; access_token?: string };
  try {
    body = (await req.json()) as { phone_number_id?: string; access_token?: string };
  } catch {
    return apiErr("Invalid JSON", 400, "400");
  }
  const phoneId = body.phone_number_id?.trim();
  const token = body.access_token?.trim();
  if (!phoneId || !token) {
    return apiErr("phone_number_id and access_token are required", 400, "400");
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
      return apiErr(json.error?.message || `Meta API error (${res.status})`, res.status >= 400 && res.status < 600 ? res.status : 502);
    }
    return apiOk({
      display_phone_number: json.display_phone_number ?? null,
      verified_name: json.verified_name ?? null,
    });
  } catch (e) {
    console.error("[test-meta]", e);
    return apiErr("Network error calling Meta", 502, "502");
  }
}
