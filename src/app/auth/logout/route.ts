import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { REMEMBER_COOKIE } from "@/lib/supabase/cookie-policy";
import { supabaseEnv } from "@/lib/supabase/env";

/** POST /auth/logout: sign out, drop the remember-device cookie, go to /login. */
export async function POST(request: NextRequest) {
  const { url, key } = supabaseEnv();
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  await supabase.auth.signOut();
  response.cookies.delete(REMEMBER_COOKIE);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
