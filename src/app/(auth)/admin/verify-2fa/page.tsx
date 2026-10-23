import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheckIcon } from "lucide-react";
import { AuthCard, AuthText, AuthTitle } from "@/components/auth/AuthCard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { TotpForm } from "@/components/auth/TotpForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "2-step login" };

export default async function VerifyTwoFactorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");
  if (!factor) redirect("/admin/setup-2fa");

  return (
    <div className="flex flex-1 justify-center md:pt-[34px]">
      <AuthCard className="max-w-[600px] self-start text-center">
        <span className="mx-auto flex size-[84px] items-center justify-center rounded-full bg-primary text-white">
          <ShieldCheckIcon className="size-8" strokeWidth={1.8} />
        </span>
        <div className="mt-6">
          <AuthTitle>Enter your 2-step code</AuthTitle>
        </div>
        <AuthText className="mx-auto mt-3 max-w-[420px]">Open your authenticator app and type the 6-digit code for Secuabase.</AuthText>
        <TotpForm factorId={factor.id} submitLabel="Verify and continue" />
        <LogoutButton className="mx-auto mt-6 w-full max-w-[320px]" variant="ghost" />
      </AuthCard>
    </div>
  );
}
