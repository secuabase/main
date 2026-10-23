import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard, AuthText, AuthTitle } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "New password" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // The recovery link logs the user in first; without that there is nothing to update.
  if (!user) redirect("/forgot-password");

  return (
    <div className="flex flex-1 justify-center md:pt-[34px]">
      <AuthCard className="max-w-[600px] self-start">
        <AuthTitle>Choose a new password</AuthTitle>
        <AuthText className="mt-2">For {user.email}. You stay logged in on this device.</AuthText>
        <ResetPasswordForm />
      </AuthCard>
    </div>
  );
}
