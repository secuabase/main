import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LockIcon } from "lucide-react";
import { AuthCard, AuthText, AuthTitle } from "@/components/auth/AuthCard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "No access" };

export default async function NoAccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-1 justify-center md:pt-[34px]">
      <AuthCard className="max-w-[600px] self-start text-center">
        <span className="mx-auto flex size-[84px] items-center justify-center rounded-full bg-tint text-primary dark:text-white">
          <LockIcon className="size-8" strokeWidth={1.8} />
        </span>
        <div className="mt-6">
          <AuthTitle>No access yet</AuthTitle>
        </div>
        <AuthText className="mx-auto mt-3 max-w-[420px]">
          <span className="text-text">{user.email}</span> is not part of a client workspace yet. Ask your admin for an invite.
        </AuthText>
        <LogoutButton className="mx-auto mt-8 w-full max-w-[320px]" />
      </AuthCard>
    </div>
  );
}
