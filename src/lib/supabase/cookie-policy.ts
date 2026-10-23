import type { CookieOptions } from "@supabase/ssr";

/**
 * "Remember this device" policy.
 *
 * Supabase writes its auth cookies through our `setAll` hook. @supabase/ssr always
 * asks for a 400-day `maxAge`. We rewrite that:
 *  - remembered device  -> maxAge 30 days
 *  - not remembered     -> no maxAge / expires at all => browser session cookie
 *
 * Which policy applies is stored in a small httpOnly cookie (`sb-remember`) that the
 * login actions set when the box is ticked and clear when it is not. Every server
 * client (proxy, server components, server actions, route handlers) reads that
 * cookie before writing auth cookies, so token refreshes keep the same lifetime.
 */
export const REMEMBER_COOKIE = "sb-remember";
export const REMEMBER_DAYS = 30;
export const REMEMBER_MAX_AGE = REMEMBER_DAYS * 24 * 60 * 60;

export function isRemembered(getCookie: (name: string) => string | undefined): boolean {
  return getCookie(REMEMBER_COOKIE) === "1";
}

export function applyRememberPolicy(options: CookieOptions, remember: boolean): CookieOptions {
  // A deletion (maxAge 0) must stay a deletion, otherwise logout would not work.
  if (options.maxAge === 0) return options;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { maxAge, expires, ...rest } = options;
  return remember ? { ...rest, maxAge: REMEMBER_MAX_AGE } : rest;
}

export function rememberCookieOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: REMEMBER_MAX_AGE,
  };
}
