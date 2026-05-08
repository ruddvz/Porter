import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (path === "/auth/forgot-password") {
    if (user) return NextResponse.redirect(new URL("/dashboard", request.url));
    return response;
  }

  if (path.startsWith("/admin")) {
    if (path === "/admin/login") {
      if (user) {
        const { data: isAdmin } = await supabase.rpc("is_platform_admin");
        if (isAdmin) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      return response;
    }
    if (!user) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", path);
      return NextResponse.redirect(login);
    }
    const { data: isAdmin, error } = await supabase.rpc("is_platform_admin");
    if (error || !isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  if ((path.startsWith("/dashboard") || path.startsWith("/onboarding")) && !user) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }
  if ((path === "/auth/login" || path === "/auth/signup" || path === "/auth/forgot-password") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/admin/:path*",
    "/track/:path*",
  ],
};
