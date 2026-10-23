import type { SupabaseClient } from "@supabase/supabase-js";

export type Portal = "/admin" | "/admin/setup-2fa" | "/admin/verify-2fa" | "/app" | "/no-access";

/**
 * Where a user goes after login.
 * Admin -> /admin, but only once the session is AAL2; before that the 2-step
 * page (set up or verify). Member -> /app. Nobody -> /no-access.
 * Returning the 2-step path from here (instead of letting the proxy redirect)
 * keeps the browser URL in sync after a server-action redirect.
 */
export async function postLoginPath(supabase: SupabaseClient, userId: string): Promise<Portal> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.is_admin) return adminPath(supabase);

  const { data: member } = await supabase
    .from("client_members")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  return member ? "/app" : "/no-access";
}

/** /admin when the session is already AAL2, else the 2-step page the admin needs. */
export async function adminPath(supabase: SupabaseClient): Promise<Portal> {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.currentLevel === "aal2") return "/admin";
  return data?.nextLevel === "aal2" ? "/admin/verify-2fa" : "/admin/setup-2fa";
}

/** True when the user is an admin whose session is not yet AAL2. */
export async function needsAdminTwoStep(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const path = await postLoginPath(supabase, userId);
  return path === "/admin/setup-2fa" || path === "/admin/verify-2fa";
}

/** Only allow same-site relative paths as a redirect target. */
export function safeNext(next: unknown, fallback = ""): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  if (next.startsWith("/auth/") || next === "/login") return fallback;
  return next;
}
