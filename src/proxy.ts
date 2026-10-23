import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Request proxy (Next 16 name for middleware).
 * 1. Host routing: supplier.secuabase.com/* -> /s/*, pay.secuabase.com/* -> /pay/*.
 * 2. Refresh the Supabase session cookie on every request.
 * 3. Gates: /admin/* and /app/* need a user; /admin/* needs profiles.is_admin and AAL2.
 */

const PUBLIC_PREFIXES = ["/login", "/check-email", "/forgot-password", "/reset-password", "/auth", "/no-access", "/s", "/pay"];
const MFA_PAGES = ["/admin/setup-2fa", "/admin/verify-2fa"];

function hostRewrite(request: NextRequest): URL | undefined {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;
  const sub = host.split(".")[0];
  if (sub === "supplier" && !pathname.startsWith("/s/") && pathname !== "/s") {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/s" : `/s${pathname}`;
    return url;
  }
  if (sub === "pay" && !pathname.startsWith("/pay")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/pay" : `/pay${pathname}`;
    return url;
  }
  return undefined;
}

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const rewriteTo = hostRewrite(request);
  const { supabase, user, response, redirect } = await updateSession(request, rewriteTo);

  const pathname = rewriteTo?.pathname ?? request.nextUrl.pathname;
  const isAdminArea = startsWithAny(pathname, ["/admin"]);
  const isAppArea = startsWithAny(pathname, ["/app"]);

  if (!isAdminArea && !isAppArea) {
    // Public pages, the supplier portal and pay.* need no session.
    if (startsWithAny(pathname, PUBLIC_PREFIXES) || pathname === "/") return response;
    return response;
  }

  if (!user) {
    const login = new URL("/login", request.url);
    const next = request.nextUrl.pathname + request.nextUrl.search;
    if (next !== "/") login.searchParams.set("next", next);
    return redirect(login);
  }

  if (isAdminArea) {
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!profile?.is_admin) {
      const { data: member } = await supabase
        .from("client_members")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      return redirect(member ? "/app" : "/no-access");
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const current = aal?.currentLevel ?? "aal1";
    const next = aal?.nextLevel ?? "aal1";
    const onMfaPage = MFA_PAGES.includes(pathname);

    if (current === "aal2") {
      // Already verified: the 2FA pages are not needed any more.
      return onMfaPage ? redirect("/admin") : response;
    }
    if (next === "aal2") {
      // Enrolled, not yet verified in this session.
      return pathname === "/admin/verify-2fa" ? response : redirect("/admin/verify-2fa");
    }
    // Not enrolled yet.
    return pathname === "/admin/setup-2fa" ? response : redirect("/admin/setup-2fa");
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and static files.
    "/((?!_next/static|_next/image|favicon|apple-touch-icon|android-chrome|site\\.webmanifest|brand/|illustrations/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
