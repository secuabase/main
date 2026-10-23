import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { postLoginPath, safeNext } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Lands here from the emails Supabase sends:
 *  - magic link:  /auth/confirm?token_hash=…&type=email[&next=/app]
 *  - recovery:    /auth/confirm?token_hash=…&type=recovery&next=/reset-password
 * Also accepts the PKCE `code` flow for safety.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  const supabase = await createClient();
  let ok = false;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }
  if (!ok) redirect("/login?error=link");

  if (type === "recovery") redirect("/reset-password");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(next || (user ? await postLoginPath(supabase, user.id) : "/login"));
}
