import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard, AuthText, AuthTitle } from "@/components/auth/AuthCard";
import { FormError } from "@/components/auth/FormError";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { TotpForm } from "@/components/auth/TotpForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Set up 2-step login" };

export default async function SetupTwoFactorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.totp.some((f) => f.status === "verified")) redirect("/admin/verify-2fa");
  // Start fresh: drop half-finished enrollments so the friendly name stays unique.
  // (`factors.totp` holds verified factors only; unverified ones are in `factors.all`.)
  for (const f of factors?.all.filter((f) => f.factor_type === "totp" && f.status !== "verified") ?? []) {
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: f.id });
    if (unenrollError) console.error("[setup-2fa] unenroll failed", unenrollError.code, unenrollError.message);
  }

  const { data: enrolled, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Secuabase admin" });
  if (error) console.error("[setup-2fa] enroll failed", error.code, error.message);

  return (
    <div className="flex flex-1 justify-center md:pt-[34px]">
      <AuthCard className="max-w-[600px] self-start text-center">
        <AuthTitle>Set up 2-step login</AuthTitle>
        <AuthText className="mx-auto mt-3 max-w-[460px]">
          Admin accounts need a second step. Scan this code with an authenticator app (Google Authenticator, 1Password, Authy), then type the
          6-digit code it shows.
        </AuthText>

        {enrolled ? (
          <>
            <div className="mx-auto mt-6 w-fit rounded-[16px] bg-white p-3 shadow-card">
              {/* Supabase returns an inline data: SVG; next/image cannot take that. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={enrolled.totp.qr_code} alt="QR code for your authenticator app" width={200} height={200} />
            </div>
            <p className="mx-auto mt-3 max-w-[460px] text-[13px] text-muted">
              Cannot scan? Type this key: <code className="rounded-md bg-tint px-1.5 py-0.5 text-[12px] text-text select-all">{enrolled.totp.secret}</code>
            </p>
            <TotpForm factorId={enrolled.id} submitLabel="Turn on 2-step login" />
          </>
        ) : (
          <FormError message={error ? "We could not start the setup. Reload the page to try again." : undefined} className="mt-6" />
        )}

        <LogoutButton className="mx-auto mt-6 w-full max-w-[320px]" variant="ghost" />
      </AuthCard>
    </div>
  );
}
