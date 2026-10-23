"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";
import { applyRememberPolicy, isRemembered } from "./cookie-policy";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
}

/**
 * Browser client. All sign-in / sign-out writes go through server actions and
 * route handlers, so this client is mostly for reads and `onAuthStateChange`.
 * It still applies the same remember-device cookie policy when it writes.
 */
export function createClient() {
  const { url, key } = supabaseEnv();
  // `sb-remember` is httpOnly, so the browser cannot normally read it. That makes
  // the safe default "session cookie" for any write this client ever does.
  const remember = isRemembered(readCookie);
  return createBrowserClient(url, key, {
    cookieOptions: remember ? { maxAge: 30 * 24 * 60 * 60 } : undefined,
    cookies: {
      getAll() {
        return document.cookie
          .split("; ")
          .filter(Boolean)
          .map((c) => {
            const i = c.indexOf("=");
            return { name: c.slice(0, i), value: decodeURIComponent(c.slice(i + 1)) };
          });
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          const o = applyRememberPolicy(options, remember);
          let str = `${name}=${encodeURIComponent(value)}; path=${o.path ?? "/"}`;
          if (o.maxAge !== undefined) str += `; max-age=${o.maxAge}`;
          if (o.sameSite) str += `; samesite=${o.sameSite === true ? "strict" : o.sameSite}`;
          if (o.secure) str += "; secure";
          document.cookie = str;
        }
      },
    },
  });
}
