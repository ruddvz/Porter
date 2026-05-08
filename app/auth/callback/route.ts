import { safeAuthNextPath } from "@/lib/auth-redirect";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * Supabase OAuth PKCE callback — exchanges `code` for a session and sets auth cookies.
 * Configure redirect URL in Supabase Dashboard → Authentication → URL Configuration.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeAuthNextPath(url.searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/login?error=oauth", url.origin));
}
