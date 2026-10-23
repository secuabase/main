import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";
import { applyRememberPolicy, isRemembered } from "./cookie-policy";

/**
 * Server client for server components, server actions and route handlers.
 * Create one per request, never share it.
 *
 * `remember` lets a login action decide the cookie lifetime before the
 * `sb-remember` cookie it just wrote is visible to this request.
 */
export async function createClient(opts: { remember?: boolean } = {}) {
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();
  const remember = opts.remember ?? isRemembered((name) => cookieStore.get(name)?.value);

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, applyRememberPolicy(options, remember));
          }
        } catch {
          // Called from a server component: cookies are read-only there.
          // src/proxy.ts refreshes the session on every request instead.
        }
      },
    },
  });
}
