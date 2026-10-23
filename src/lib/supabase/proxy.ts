import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";
import { applyRememberPolicy, isRemembered } from "./cookie-policy";

export type SessionResult = {
  supabase: SupabaseClient;
  user: User | null;
  /** The response to return (keeps refreshed auth cookies). */
  response: NextResponse;
  /** Build a redirect that carries the refreshed auth cookies along. */
  redirect: (to: URL | string) => NextResponse;
};

/**
 * Standard @supabase/ssr request-middleware pattern: read the auth cookies, let
 * Supabase refresh the session, write the new cookies to both the forwarded
 * request and the outgoing response.
 *
 * `rewriteTo` lets host routing (supplier.* / pay.*) and the session refresh
 * share one response object.
 */
export async function updateSession(request: NextRequest, rewriteTo?: URL): Promise<SessionResult> {
  const { url, key } = supabaseEnv();
  const remember = isRemembered((name) => request.cookies.get(name)?.value);

  const makeResponse = () =>
    rewriteTo
      ? NextResponse.rewrite(rewriteTo, { request: { headers: request.headers } })
      : NextResponse.next({ request: { headers: request.headers } });

  let response = makeResponse();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = makeResponse();
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, applyRememberPolicy(options, remember));
        }
        for (const [k, v] of Object.entries(headers ?? {})) response.headers.set(k, v);
      },
    },
  });

  // Do not run code between createServerClient and getUser(): a refreshed token
  // must be written before anything else reads the session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirect = (to: URL | string) => {
    const target = typeof to === "string" ? new URL(to, request.url) : to;
    const res = NextResponse.redirect(target);
    for (const c of response.cookies.getAll()) res.cookies.set(c);
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  };

  return { supabase, user, response, redirect };
}
