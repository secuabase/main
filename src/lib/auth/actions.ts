"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { REMEMBER_COOKIE, rememberCookieOptions } from "@/lib/supabase/cookie-policy";
import { authErrorMessage } from "./messages";
import { postLoginPath, safeNext } from "./redirect";

export type ActionState = { error?: string; ok?: boolean };

const email = z.string().trim().toLowerCase().email();
const otp = z.string().trim().regex(/^\d{6}$/);

/** https://host of this request, used for links Supabase sends by email. */
async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Store the "remember this device" choice (see cookie-policy.ts). */
async function setRemember(remember: boolean) {
  const store = await cookies();
  if (remember) store.set(REMEMBER_COOKIE, "1", rememberCookieOptions());
  else store.delete(REMEMBER_COOKIE);
}

async function finishLogin(next: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // An admin without 2-step goes to the 2-step page first, even if a `next` was asked for;
  // the proxy sends them on to /admin once the session is AAL2.
  const portal = await postLoginPath(supabase, user.id);
  if (portal === "/admin/setup-2fa" || portal === "/admin/verify-2fa") redirect(portal);
  redirect(safeNext(next) || portal);
}

export async function loginWithPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({ email, password: z.string().min(1), remember: z.string().optional(), next: z.string().optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Type your work email and your password." };

  const remember = parsed.data.remember === "on";
  await setRemember(remember);
  const supabase = await createClient({ remember });
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { error: authErrorMessage(error) };

  await finishLogin(parsed.data.next ?? "");
  return { ok: true };
}

export async function requestLoginLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({ email, remember: z.string().optional(), next: z.string().optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Type your work email first." };

  const remember = parsed.data.remember === "on";
  await setRemember(remember);
  const next = safeNext(parsed.data.next);
  const supabase = await createClient({ remember });
  const origin = await siteOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/confirm${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    },
  });
  if (error) return { error: authErrorMessage(error) };

  const q = new URLSearchParams({ email: parsed.data.email });
  if (next) q.set("next", next);
  redirect(`/check-email?${q.toString()}`);
}

export async function resendLoginLink(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z.object({ email, next: z.string().optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "We lost the email address. Go back and type it again." };
  const next = safeNext(parsed.data.next);
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/confirm${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    },
  });
  if (error) return { error: authErrorMessage(error) };
  return { ok: true };
}

export async function verifyLoginCode(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z.object({ email, token: otp, next: z.string().optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Type the 6 digits from the email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email: parsed.data.email, token: parsed.data.token, type: "email" });
  if (error) return { error: authErrorMessage(error, "That code is not right or has expired. Ask for a new one.") };

  await finishLogin(parsed.data.next ?? "");
  return { ok: true };
}

export async function forgotPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z.object({ email }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Type your work email first." };

  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?type=recovery&next=/reset-password`,
  });
  if (error && error.code?.startsWith("over_")) return { error: authErrorMessage(error) };
  // Do not reveal whether the email exists.
  redirect(`/forgot-password?sent=1&email=${encodeURIComponent(parsed.data.email)}`);
}

export async function resetPassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({ password: z.string().min(8), confirm: z.string() })
    .refine((d) => d.password === d.confirm, { path: ["confirm"] })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue?.path[0] === "confirm" ? "The two passwords are not the same." : "Use at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: authErrorMessage(error) };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(user ? await postLoginPath(supabase, user.id) : "/login");
}

/** Admin 2-step: create a TOTP challenge for the factor and verify the code. */
export async function verifyTotp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z.object({ factorId: z.string().min(1), code: otp }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Type the 6 digits from your authenticator app." };

  const supabase = await createClient();
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: parsed.data.factorId });
  if (challengeError || !challenge) return { error: authErrorMessage(challengeError) };

  const { error } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId: challenge.id,
    code: parsed.data.code,
  });
  if (error) return { error: authErrorMessage(error, "That 2-step code is not right. Try the next code from your app.") };

  redirect("/admin");
}
