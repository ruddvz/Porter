/** Opt-in: set when Google provider is enabled in Supabase Auth and redirect URLs include `/auth/callback`. */
export function isGoogleAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
}
